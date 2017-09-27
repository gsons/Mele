angular.module('ctrls.controllers', ['angularFileUpload', 'starter.services'])
    // 我的收益
    .controller('icController', function ($scope, $rootScope, $http, $location, dateService,$filter) {
        $rootScope.icarr = "";
        $rootScope.ictotal = 0;     // 预约收益金额
        $rootScope.cfictotal = 0;   // 处方收益金额
        var today = new Date();
        var yesDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()-1);
        $scope.yesDate = $filter('date')(yesDay, 'yyyy-MM-dd'); // 昨天的日期
        var startDate = '';
        var endDate = '';

        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/paysys/presordersettle/getWxSettleOrderAmount?docAccount=' + $rootScope.aa + '&startDate=' + startDate + '&endDate=' + endDate
        }).success(function (data) {
            for (var i = 0; i < data.roots.length; i++) {
                if (data.roots[i].type == '0') {
                    $rootScope.ictotal = data.roots[i].firstAmount;
                } else if (data.roots[i].type == '1') { // 处方收益数据
                    $rootScope.cfictotal = data.roots[i].firstAmount;
                } else {
                    $rootScope.ictotal = 0;
                    $rootScope.cfictotal = 0;
                }
            }
        }).error(function (data) {
            ZENG.msgbox.show('获取数据是败！', 5, 1500);
        })

        $scope.incomelist = function () { // 跳转到预约明细页面
            $location.path('app/iclist');
            $rootScope.dict = 1;
        }
        $scope.cfincomelist = function () {// 跳转到处方明细页面
            $location.path('app/cficlist');
            $rootScope.dict = 1;
        }

        $scope.wdlist = function () {
            $location.path('app/wdlist');
        }
        $scope.withdraw = function (ictotalCount) {
            $rootScope.ictotalCount = ictotalCount;
            $location.path('app/withdraw');
        }
    })
    // 预约收益
    .controller('iclistController', function ($scope, $rootScope, $http, $location, locals, dateService, $filter) {
        $scope.searchType = 1;          // 1:全部；2：根据出诊日期搜索；3：根据提现状态搜索;4:前七天记录
        $scope.currentDate = new Date();// 获取当前日期
        $scope.showIndex = [];          // 每条数据的展开状态
        $scope.selectDatas = [];        // 已选择的数据
        $scope.selectDatasLen = 0;      // 已选择的数据的数组长度(数量)
        $scope.isSelectAll = false;     // 是否全选标识
        $scope.amountCount = 0;         // (选择的)预约总金额
        $scope.firstAmountCount = 0;    // (选择的)医生收益总额
        $scope.showList = [];           // 用于页面显示
        var startPayDate = dateService.getBeforeDate(6); // 获取七天前日期
        var endPayDate = dateService.getBeforeDate(0);   // 获取当前日期
        var page = 1, limit = 20, start = 0;

        $scope.loadNextDatas = function () { // 加载下一页数据
            var getDatasURL = '';
            switch ($scope.searchType) {
                case '1'://全部记录
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
                case '2'://看诊日期
                    var reserDate = $filter('date')($scope.currentDate, 'yyyy-MM-dd');
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&reserDate=' + reserDate;
                    break;
                case '3'://提现状态
                    var settleStatus = $scope.moneyStatus == undefined ? 0 : $scope.moneyStatus;
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&settleStatus=' + settleStatus;
                    break;
                case '4'://前七天记录
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&startPayDate=' + startPayDate + '&endPayDate=' + endPayDate + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
            }
            $http({
                method: 'get',
                url: getDatasURL
            }).success(function (data) {
                if (data.success) {
                    $scope.isCancelLoadDatas = data.roots.length == 0 ? true : false;// 判断是否有更多数据加载
                    if (!$scope.isCancelLoadDatas) {   // 再次加载数据，全选变为false
                        $scope.isSelectAll = false;
                    }
                    page = page + 1;
                    start += limit;
                    filterDatas(data.roots);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show('获取数据失败！', 5, 1500);
            })
        }

        $scope.searchMoney = function () {
            $scope.selectDatas = [];    // 清空数据，以免造成跟原来数据重复叠加
            $scope.amountCount = 0;     // 清空数据，以免造成跟原来数据重复叠加
            $scope.firstAmountCount = 0;// 清空数据，以免造成跟原来数据重复叠加
            $scope.showIndex = [];
            var newList = [];
            $scope.showList = [];
            page = 1, limit = 20, start = 0;
            var getDatasURL = '';
            switch ($scope.searchType) {
                case '1':  // 全部记录
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
                case '2':   // 看诊日期
                    var reserDate = $filter('date')($scope.currentDate, 'yyyy-MM-dd');
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&reserDate=' + reserDate;
                    break;
                case '3':   // 提现状态
                    var settleStatus = $scope.moneyStatus == undefined ? 0 : $scope.moneyStatus;
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&settleStatus=' + settleStatus;
                    break;
                case '4':   // 前七天记录
                    getDatasURL = 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?docAccount=' + $rootScope.aa + '&startPayDate=' + startPayDate + '&endPayDate=' + endPayDate + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
            }
            $http({
                method: 'get',
                url: getDatasURL
            }).success(function (data) {
                // console.log(data);
                $scope.isCancelLoadDatas = data.roots.length == 0 ? true : false;// 判断是否有更多数据加载
                if (!$scope.isCancelLoadDatas) {   // 再次加载数据，全选变为false
                    $scope.isSelectAll = false;
                }
                filterDatas(data.roots); // 将数据放到显示数组中
                page += 1;
                start += limit;
                $scope.selectDatasLen = $scope.selectDatas.length;
            });
        }

        $scope.addData = function (ic) {
            if (ic.checked == true) {
                $scope.selectDatas.push(ic);
                jsonstr = JSON.stringify($scope.selectDatas);
                var a = ic.amount * 10000;
                var b = ic.firstAmount * 10000;
                $scope.amountCount += a;
                $scope.firstAmountCount += b;
            } else {
                jsonstr = JSON.stringify(ic);
                $scope.removeByValue($scope.selectDatas, ic);
                jsonstr = JSON.stringify($scope.selectDatas);
                var a = ic.amount * 10000;
                var b = ic.firstAmount * 10000;
                $scope.amountCount -= a;
                $scope.firstAmountCount -= b;
            }
            $scope.selectDatasLen = $scope.selectDatas.length;
            jsonstr = jQuery.trim(jsonstr);
        }

        $scope.removeByValue = function (arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
            $scope.selectDatasLen = $scope.selectDatas.length;
        };

        $scope.selectAll = function (data) {
            $scope.selectDatas = [];        // 清空数据，以免造成跟原来数据重复叠加
            $scope.amountCount = 0;         // 清空数据，以免造成跟原来数据重复叠加
            $scope.firstAmountCount = 0;    // 清空数据，以免造成跟原来数据重复叠加
            if ($scope.isSelectAll == true) {
                for (var i = 0; i < data.length; i++) {
                    data[i].checked = true;
                    $scope.addData(data[i]);
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    data[i].checked = false;
                }
            }
            $scope.selectDatasLen = $scope.selectDatas.length;
        }

        // 返回每一笔记录的详情的状态(展开或收起状态)
        $scope.showListDetail = function (index) {
            $scope.showIndex[index] = !$scope.showIndex[index]
        }

        var filterDatas = function (datasArr) { // 将数据放到显示数组中
            var orderId = '';
            for (var i = 0; i < datasArr.length; i++) {
                datasArr[i].checked = false;
                $scope.showList.push(datasArr[i]);
            }
        }

    })
    // 处方收益
    .controller('cficlistController', function ($scope, $rootScope, $http, $filter, $location, locals, dateService) {
        $scope.cfsearchType = 1; // 1:全部；2：根据出诊日期搜索；3：根据提现状态搜索
        $scope.cfcurrentDate = new Date();
        $scope.cfshowIndex = [];  // 每条数据的展开状态
        $scope.cfselectDatas = [];// 已选择的数据
        $scope.cfselectDatasLen = 0;
        $scope.cfisSelectAll = false;
        $scope.cfamountCount = 0; //预约总金额(选择的)
        $scope.cffirstAmountCount = 0;    //医生收益总额(选择的)
        $scope.cfshowList = [];
        var startPayDate = dateService.getBeforeDate(6); // 获取七天前日期
        var endPayDate = dateService.getBeforeDate(0);   // 获取当前日期
        var page = 1, limit = 10, start = 0;
        $scope.loadNextCFDatas = function () {
            var getLNCFDatasURL = '';
            switch ($scope.cfsearchType) {
                case '1':
                    getLNCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
                case '2':
                    var recordDate = $filter('date')($scope.cfcurrentDate, 'yyyy-MM-dd');
                    getLNCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&recordDate=' + recordDate;
                    break;
                case '3':
                    var settleStatus = $scope.cfmoneyStatus == undefined ? 0 : $scope.cfmoneyStatus;
                    getLNCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&settleStatus=' + settleStatus;
                    break;
                case '4':
                    getLNCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&startPayDate=' + startPayDate + '&endPayDate=' + endPayDate + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
            }
            $http({
                method: 'get',
                url: getLNCFDatasURL
            }).success(function (data) {
                if (data.success) {
                    $scope.isCancelLoadCFDatas = data.roots.length == 0 ? true : false;// 判断是否有更多数据加载
                    if (!$scope.isCancelLoadCFDatas) {   // 再次加载数据，全选变为false
                        $scope.cfisSelectAll = false;
                    }
                    page += 1;
                    start += limit;
                    filterDatas(data.roots);// 过滤退款处方信息
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            })
        }
        $scope.searchMoney = function () {
            $scope.cfselectDatas = [];       // 清空数据，以免造成跟原来数据重复叠加
            $scope.cfamountCount = 0;// 清空数据，以免造成跟原来数据重复叠加
            $scope.cffirstAmountCount = 0;   // 清空数据，以免造成跟原来数据重复叠加
            $scope.cfshowIndex = [];
            var cfnewList = [];
            $scope.cfshowList = [];
            page = 1, limit = 20, start = 0;
            switch ($scope.cfsearchType) {
                case '1':  // 全部记录
                    getCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
                case '2':   // 看诊日期
                    var recordDate = $filter('date')($scope.cfcurrentDate, 'yyyy-MM-dd');
                    getCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&recordDate=' + recordDate;
                    break;
                case '3':   // 提现状态
                    var settleStatus = $scope.cfmoneyStatus == undefined ? 0 : $scope.cfmoneyStatus;
                    getCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&page=' + page + '&start=' + start + '&limit=' + limit + '&settleStatus=' + settleStatus;
                    break;
                case '4':   // 前七天记录
                    // console.log(startPayDate + "  " + endPayDate);
                    getCFDatasURL = 'http://localhost/medicalsys/paysys/presordersettle/getPresOrderSettleList?docAccount=' + $rootScope.aa + '&startPayDate=' + startPayDate + '&endPayDate=' + endPayDate + '&page=' + page + '&start=' + start + '&limit=' + limit;
                    break;
            }
            $http({
                method: 'get',
                url: getCFDatasURL
            }).success(function (data) {
                // console.log(data);
                $scope.isCancelLoadCFDatas = data.roots.length == 0 ? true : false;// 判断是否有更多数据加载
                if (!$scope.isCancelLoadCFDatas) {   // 再次加载数据，全选变为false
                    $scope.cfisSelectAll = false;
                }
                page += 1;
                start += limit;
                filterDatas(data.roots);
                $scope.cfselectDatasLen = $scope.cfselectDatas.length;
            });
        }
        $scope.addData = function (ic) {
            if (ic.checked == true) {
                $scope.cfselectDatas.push(ic);
                jsonstr = JSON.stringify($scope.cfselectDatas);
                var a = parseFloat(ic.amount);
                var b = parseFloat(ic.firstAmount);
                $scope.cfamountCount += a;
                $scope.cffirstAmountCount += b;

            } else {
                jsonstr = JSON.stringify(ic);
                $scope.removeByValue($scope.cfselectDatas, ic);
                jsonstr = JSON.stringify($scope.cfselectDatas);
                var a = parseFloat(ic.amount);
                var b = parseFloat(ic.firstAmount);
                $scope.cfamountCount -= a;
                $scope.cffirstAmountCount -= b;
            }
            $scope.cfselectDatasLen = $scope.cfselectDatas.length;
            jsonstr = jQuery.trim(jsonstr);
        }
        $scope.removeByValue = function (arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    arr.splice(i, 1);
                    break;
                }
            }
        };
        $scope.selectAll = function (data) {
            $scope.cfselectDatas = [];       // 清空数据，以免造成跟原来数据重复叠加
            $scope.cfamountCount = 0;// 清空数据，以免造成跟原来数据重复叠加
            $scope.cffirstAmountCount = 0;   // 清空数据，以免造成跟原来数据重复叠加
            if ($scope.cfisSelectAll == true) {
                for (var i = 0; i < data.length; i++) {
                    data[i].checked = true;
                    $scope.addData(data[i]);
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    data[i].checked = false;
                }
            }
            $scope.cfselectDatasLen = $scope.cfselectDatas.length;
        }

        // 返回每一笔记录的详情的状态(展开或收起状态)
        $scope.showListDetail = function (index) {
            $scope.cfshowIndex[index] = !$scope.cfshowIndex[index]
        }

        var filterDatas = function (datasArr) { // 过滤退款的预约订单
            var orderId = '';
            for (var i = 0; i < datasArr.length; i++) { // 过滤退款处方信息
                datasArr[i].checked = false;
                $scope.cfshowList.push(datasArr[i]);
            }
        }
    })
    // 就诊记录
    .controller('medicalRecodesCtrl', function ($scope, $rootScope, $http, $location, $ionicHistory,$ionicModal) {
        var pid = $location.search().pid;
        $scope.cfRecode = {};
        $scope.cfshowIndex = [];  // 每条数据的展开状态
        // 获取处方信息
        $http({
            method: 'get',
            url: "http://localhost/medicalsys/mzsys/getPrescriptionList?flag=2&pid=" + pid
        }).success(function (data) {
            // console.log(data);
            // $scope.chufangRecodes = data.roots;
            var cflists = data;
            var cfes = [];
            var chues = [];
            for (i = 0; i < cflists.len; i++) {
                var index = "list" + i;
                var cfs = eval('(' + (cflists)[index].patient + ')');
                cfes.push(cfs);
                var chufs = eval('(' + (cflists)[index].preList + ')');
                chues.push(chufs);
            }

            var cfList = [];
            var datas = chues[0]; //因为带了id 应该是只有一条数据
            for (var i = 0; i < datas.length; i++) {
                cfList.push(datas[i]);
            }
            $scope.cfPatientMess = cfes;
            $scope.chufangRecodes = cfList;
        }).error(function (data) {
            // console.log(data);
            ZENG.msgbox.show('获取数据失败！', 1, 1500);
        })
        $scope.showRecodeDetail = function (index, pid, times, prescriptionSn) {
            $scope.cfshowIndex[index] = !$scope.cfshowIndex[index] // 显示标识
            if ($scope.cfshowIndex[index] && $scope.cfRecode[index] == undefined) { // 需要显示则加载数据
                $http({
                    method: 'get',
                    url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + pid + '&times=' + times + '&accountSn=0&prescriptionSn='+prescriptionSn+'&flag=2&dataType=0'
                }).success(function (data) {
                    var a = JSON.parse(data.list)
                    if (a == '' || a == undefined) {
                        return
                    }
                    // console.log(a);
                    var YPtempDatas = []; // 药材
                    for (var i = 0; i < a.length; i++) { // 处理开了多种药材
                        var temp = {};
                        temp['chargeCode'] = a[i].chargeCode; // 药材编号
                        temp['chargeName'] = a[i].chargeName; // 药材名称
                        temp['dosage'] = a[i].dosage; // 药材数量
                        temp['price'] = a[i].price; // 药材总价
                        temp['origPrice'] = a[i].origPrice; // 药材单价
                        temp['herbalAmount'] = a[i].herbalAmount; // 处方付数
                        temp['blRecord'] = a[i].blRecord; // 病历
                        YPtempDatas[i] = temp;
                    }
                    $scope.cfRecode[index] = a[0];
                    YPtempDatas['herbalAmount'] = a[0].herbalAmount;
                    $scope.cfRecode[index]['yc'] = YPtempDatas
                    // console.log($scope.cfRecode);
                }).error(function (data) {
                    // console.log(data);
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                })
            }
        }
        $scope.loadJCD = function (pid, oid) {
            /*@patientId，--病人ID；@orderId，--订单ID*/
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/empPatient/attchements/getBrCheckLists?patientId=' + pid + "&userType=0&orderId=" + oid
            }).success(function (data) {
                console.log(data);
                if (data.success) {
                    $scope.pImages = data.roots

                    // 初始化 使其默认显示检查单
                    $scope.showPic = [];
                    $('#JCD1').css({
                        'background-color': '#ae7649',
                        'color': 'white'
                    });
                    $('#JCD2').css({
                        'background-color': 'white',
                        'color': '#ae7649'
                    });
                    $('#JCD3').css({
                        'background-color': 'white',
                        'color': '#ae7649'
                    });
                    $scope.imgTitle = '检 查 单';
                    for (var i in $scope.pImages) {
                        if ($scope.pImages[i].type == 1) {
                            $scope.showPic.push($scope.pImages[i]);
                        }
                    }
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show('获取数据失败！', 1, 1500);
            });
            $scope.modal.show();
        }
        $ionicModal.fromTemplateUrl('templet.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.showJCD = function (type, imgTitle, $event) {
            $scope.imgTitle = imgTitle;
            $($event.target).parent().children().css({
                'background-color': 'white',
                'color': '#ae7648'
            });
            $($event.target).css({
                'background-color': '#ae7648',
                'color': 'white'
            });
            $scope.showPic = [];
            for (var i in $scope.pImages) {
                if ($scope.pImages[i].type == type) {
                    $scope.showPic.push($scope.pImages[i]);
                }
            }
        }
        $ionicModal.fromTemplateUrl('mypic-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.myPicmodal = modal;
        });
        $scope.picshow = function (item, title) {
            $scope.title = title;
            $scope.myPicmodal.show();
            $scope.item = 'http://image.tcmtrust.com' + item;
        };
        $scope.resize = function (item) {
            var img = new Image();
            img.src = item;
            pw = img.width;
            ph = img.height;
            var oimg = document.getElementById('imgc');
            oimg.style.height = ph + 'px';
            oimg.style.width = pw + 'px';
        };
        $scope.bigger = function (item) {
            var img = document.getElementById('imgc');
            pw = img.width;
            ph = img.height;
            pw = pw * 1.2;
            ph = ph * 1.2;
            img.style.height = ph + 'px';
            img.style.width = pw + 'px';

        }
        $scope.smaller = function (item) {
            var img = document.getElementById('imgc');
            pw = img.width;
            ph = img.height;
            pw = pw * 0.8;
            ph = ph * 0.8;
            img.style.height = ph + 'px';
            img.style.width = pw + 'px';
        }
    })
    // 快捷开方
    .controller('fastPresCtrl', function ($scope, $rootScope, $http, $location, $ionicHistory, docService, $timeout) {
        // 获取工作室信息//进入页面之前，获取医生之前选择的工作室
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/doctors/studio/getStudioList',
        }).success(function (data) {
            console.log(data);
            $rootScope.fuzhen=data.list[0].treatmentfee;
            $rootScope.docHisId=data.list[0].docHisId;
            $rootScope.studioId=data.list[0].id;
            $scope.docRoomDatas = data.list[0];
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/userfollower/user2studio/getUser2StudioList?studioId=' + $scope.docRoomDatas.id
            }).success(function (data) {
                // console.log(data);//docHisId
                $scope.showData = data.roots;
                $scope.showDataLen = data.total;
                $scope.allDatasLen = data.total;
                $scope.allDatas = data.roots;
            }).error(function (data) {
                // console.log(data);
            });
        }).error(function (data) {
            console.log(dasta);
        })

        $scope.searchFollowUser = function () {// 根据关键搜索关注的用户
            $scope.showData = [];
            $scope.showDataLen = 0;
            // console.info("搜索值：" + $scope.searchVal);
            for (var i = 0; i < $scope.allDatasLen; i++) {
                // userName 转码
                $scope.allDatas[i].userName = unescape($scope.allDatas[i].userName.replace(/\\/g, "%"));
                if ($scope.allDatas[i].userAccount.indexOf($scope.searchVal) >= 0 || $scope.allDatas[i].userName.indexOf($scope.searchVal) >= 0)
                    $scope.showData.push($scope.allDatas[i]);
            }
            $scope.showDataLen = $scope.showData.length;
        }

        $scope.shareDocRoom = function (n) {
            $scope.stuname = n.name;
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser'
            }).success(function (datas) {
                if (datas.success) {
                    docService.docname = datas.roots[0].name;
                    docService.skills = datas.roots[0].skills;
                    docService.studio = datas.roots[0].studioName;
                    $("#pop").css({
                        "visibility": "visible"
                    });
                    $(".notice").css("visibility", "visible");
                    $(".mask").css({"opacity": "0.8"});
                    var imgurl = docService.docavatar.replace(/\\/g, "\/");
                    window.event ? window.event.cancelBubble = true : e.stopPropagation();
                    if (typeof(WeixinJSBridge) !== "undefined") {
                        wx.ready(function () {
                            wx.onMenuShareAppMessage({
                                title: docService.studio,
                                desc: docService.skills, // 店铺名
                                link: 'http://localhost/user/#/app/docinfo?code=' + n.code+ '&type=1', // 商品购买地址
                                imgUrl: imgurl,// 分享的图标
                                success: function () {
                                },
                                fail: function (res) {
                                    alert(JSON.stringify(res));
                                }
                            });
                        });
                    }
                    $timeout(function () {
                        $("#pop").css("visibility", "hidden");
                        $(".notice").css("visibility", "hidden");
                    }, 2000);
                }
            }).error(function () {
                ZENG.msgbox.show('获取医生信息失败', 5, 1500);
            });
        };

        $scope.drugOnline = function (id) {
            // 跳转到线上抓药页面
            // $location.url()
            $rootScope.uid = id.userId;
            $rootScope.userName = id.userAccount;
            $location.path('/app/kaifan');
        }
    })
    // 处方列表
    .controller('sugUse2Ctrl', function ($scope, $rootScope, $http, $location, $ionicHistory, $ionicPopup,locals) {
        //获取上一次历史处方列表
        $http({
            method: 'get',
            timeout: 60000,
            url: 'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid=' + $rootScope.sickId + '&times=' + ($rootScope.times - 1)
        }).success(function (data) {
            if (data) {
                // console.log(data);
                var objcf = data.list0.preList;
                $scope.prelists = eval('(' + objcf + ')');
                // console.log($scope.prelists);
                if ($scope.prelists == '' || $scope.prelists == undefined) {
                    $scope.premax = 2;
                } else {
                    var max = 1;
                    for (var l in $scope.prelists) {
                        if (parseInt(($scope.prelists)[l].prescriptionSn) >= max) {
                            max = parseInt(($scope.prelists)[l].prescriptionSn);
                        }
                    }
                    // console.log('上次处方数量：' + max);
                    $scope.premax = parseInt(max) + 1;
                }
            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });
        // 获取本次就诊处方列表
        $http({
            method: 'get',
            timeout: 60000,
            url: 'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid=' + $rootScope.sickId + '&times=' + $rootScope.times
        }).success(function (data) {
            if (data) {
                // console.log(data);
                var objcf = data.list0.preList;
                $scope.prelists2 = eval('(' + objcf + ')');
                // console.log($scope.prelists2);
                if ($scope.prelists2 == '' || $scope.prelists2 == undefined) {
                    $scope.premax2 = 2;
                } else {
                    var max = 1;
                    for (var l in $scope.prelists2) {
                        if (parseInt(($scope.prelists2)[l].prescriptionSn) >= max) {
                            max = parseInt(($scope.prelists2)[l].prescriptionSn);
                        }
                    }
                    // console.log('本次处方数量：' + max);
                    $scope.premax2 = parseInt(max) + 1;
                }
            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });
        //展开上次历史处方
        $scope.isshowcf = false;
        $scope.showcflist = function () {
            $scope.isshowcf = !$scope.isshowcf;
        };
        //展开本次历史处方
        $scope.isshowcf2 = true;
        $scope.showcflist2 = function () {
            $scope.isshowcf2 = !$scope.isshowcf2;
        };
        function showCFDetails() {
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/showCFDetails.html",
                title: '查看处方',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '返回',
                }]
            });
        }
        function organizeData(data) {
            // 整理多个药材时的数据
            if (data == '' || data == undefined) {
                return '';
            }
            var YPtempDatas = []; // 药材
            for (var i = 0; i < data.length; i++) { // 处理开了多种药材
                var temp = {};
                temp['chargeCode'] = data[i].chargeCode; // 药材编号
                temp['chargeName'] = data[i].chargeName; // 药材名称
                temp['dosage'] = data[i].dosage; // 药材数量
                temp['supplyName'] = data[i].supplyName; // 药材用法
                temp['comment'] = data[i].comment; // 药材特殊用法
                temp['price'] = data[i].price; // 药材总计
                temp['origPrice'] = data[i].origPrice; // 药材单价
                temp['herbalAmount'] = data[i].herbalAmount; // 处方付数
                YPtempDatas[i] = temp;
            }
            YPtempDatas['herbalAmount'] = data[0].herbalAmount;
            $scope.predetails = data[0];
            $scope.predetails['yc'] = YPtempDatas
            // console.log($scope.predetails);
        }
        $scope.checkcf = function (item) {
            // console.log(item);
            // 获取病人历史处方详细
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + item.pid + '&times=' + item.times + '&accountSn=0&prescriptionSn=' + item.prescriptionSn + '&flag=2&dataType=0'
            }).success(function (data) {
                // console.log(data);
                var objcf = data.list;
                var preLists = JSON.parse(objcf);
                // console.log(preLists);
                // 整理数据
                if (organizeData(preLists)) {
                    ZENG.msgbox.show('此处方没有相关数据！', 5, 1500);
                    return;
                };
                showCFDetails();
            }).error(function (data) {
                // console.log(data);
            })
        }
        $scope.updatecf = function (item) {
            // 获取病人历史处方详细
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + item.pid + '&times=' + item.times + '&accountSn=0&prescriptionSn=' + item.prescriptionSn + '&flag=2&dataType=0'
            }).success(function (data) {
                // console.log(data);
                var objcf = data.list;
                var pres = JSON.parse(objcf);
                // console.log(preLists);
                // 整理数据
                // if (organizeData(pres)) {
                //     ZENG.msgbox.show('此处方没有添加药材！', 5, 1500);
                //     return;
                // };
                // $rootScope.updatePre = $scope.predetails;
                $rootScope.updatePre = pres;
                $rootScope.currentPrescriptionSn = item.prescriptionSn;
                $location.path('app/sugUse3');
            }).error(function (data) {
                // console.log(data);
            })
            // $location.path('app/updateCF');
        }
        //删除处方
        $scope.delcf = function (y) {
            if(confirm("确定删除该处方吗？")){
                $http({
                    method: 'get',
                    url: 'http://localhost/medicalsys/mzsys/delDetail?pid=' + y.pid + '&times=' + y.times + '&prescriptionSn=' + y.prescriptionSn
                }).success(function (data) {
                    if (data.success) {
                        ZENG.msgbox.show('删除处方成功！',1,1500);
                        $http({
                            method: 'get',
                            timeout: 60000,
                            url: 'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid=' + $rootScope.sickId + '&times=' + $rootScope.times
                        }).success(function (data) {
                            if (data) {
                                // console.log(data);
                                var objcf = data.list0.preList;
                                $scope.prelists2 = eval('(' + objcf + ')');
                                // console.log($scope.prelists);
                                if ($scope.prelists2 == '' || $scope.prelists2 == undefined) {
                                    $scope.premax = 2;
                                } else {
                                    var max = 1;
                                    for (var l in $scope.prelists2) {
                                        if (parseInt(($scope.prelists2)[l].prescriptionSn >= max)) {
                                            max = parseInt(($scope.prelists2)[l].prescriptionSn);
                                        }
                                    }
                                    // console.log(max);
                                    $scope.premax = parseInt(max) + 1;
                                }
                            } else {
                                ZENG.msgbox.show(data.errorMessage, 1, 1500);
                            }
                        }).error(function () {
                            ZENG.msgbox.show(data.errorMessage, 5, 1500);
                        });
                    } else {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    }
                }).error(function (data) {
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                });
            }else{return;}
        }
        $scope.addCF = function () {
            // $location.path('app/sugUse');
            // $rootScope.kf='普通';
            locals.set('localYC', '');
            $location.path('app/nSugUse');
        }
        $scope.backToDotdiag = function () {
            $location.path('/app/dotdiag');
        }
    })
    // 修改处方
    .controller('sugUse3Ctrl', function ($scope, $rootScope, $http, $location, $ionicHistory,$ionicModal,$ionicPopup,dataServComm) {
        $scope.thisPrescriptionSn = $rootScope.updatePre[0].prescriptionSn; // 获取修改的处方序号
        $scope.premax = $scope.thisPrescriptionSn;
        var sumStartPrice = function (data) {
            var sum = 0;
            for (var i = 0; i < data.length; i++) {
                sum += parseFloat(data[i].ypPrice);
            }
            return sum;
        };
        var arrindex = 0, nowindex = 0;
        $scope.showMethod = false;
        $scope.showfYc = false; //显示药材搜寻结果
        $scope.herbalAmount = parseFloat($rootScope.updatePre[0].herbalAmount); //药材多少味
        $scope.totalPrice = sumStartPrice($rootScope.updatePre); //总金额
        $scope.showHis = false; //处方详细
        $scope.comments = ["焗服", "包煎", "炒", "冲服", "打碎", "后下", "化服", "另包", "另炒", "吞服", "外洗", "先煎", "烊化"];
        $scope.showaddpre = [];
        ($scope.showaddpre)[arrindex] = [];
        ($scope.showaddpre)[arrindex].list = $rootScope.updatePre;
        ($scope.showaddpre)[arrindex].herbalAmount = parseFloat($rootScope.updatePre[0].herbalAmount);
        $scope.showchoose = [];
        $scope.showchoose.list = $rootScope.updatePre;
        $scope.showchoose = dataServComm.setDosageToFloat($scope.showchoose);
        // 获取上次看诊已开处方
        $http({
            method: 'get',
            timeout: 60000,
            url: 'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid=' + $rootScope.sickId + '&times=' + ($rootScope.times - 1)
        }).success(function (data) {
            if (data) {
                // console.log(data);
                var objcf = data.list0.preList;
                $scope.prelists = eval('(' + objcf + ')');
                // console.log($scope.prelists);

            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });
        // 加载医生常开药材
        $http({
            method: 'post',
            url: 'http://localhost/medicalsys/mzsys/getDoctorYP?doctorCode=' + $rootScope.docHisId
        }).success(function (data) {
            $scope.dcComYC = data.roots; // 医生常开药材
        }).error(function (data) {
        });
        // 检查常用药材是否已选
        $scope.checkYC = function (ycCode) {
            // @ycCode 常用药材的code
            if ($scope.showchoose.list == undefined || $scope.showchoose.list == 'undefined') {
                return false;
            }
            for (var i = 0; i < $scope.showchoose.list.length; i++) {
                if (ycCode === $scope.showchoose.list[i].chargeCode) {
                    return true;
                } else {
                    continue;
                }
            }
            return false;
        }
        //删除处方
        $scope.delcf = function (y) {
            if (confirm("确定删除该处方吗？")) {
                $http({
                    method: 'get',
                    url: 'http://localhost/medicalsys/mzsys/delDetail?pid=' + y.pid + '&times=' + y.times + '&prescriptionSn=' + y.prescriptionSn
                }).success(function (data) {
                    if (data.success) {
                        ZENG.msgbox.show('删除处方成功！', 1, 1500);
                        $http({
                            method: 'get',
                            timeout: 60000,
                            url: 'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid=' + $rootScope.sickId + '&times=' + $rootScope.times
                        }).success(function (data) {
                            if (data) {
                                // console.log(data);
                                var objcf = data.list0.preList;
                                $scope.prelists = eval('(' + objcf + ')');
                                // console.log($scope.prelists);
                                if ($scope.prelists == '' || $scope.prelists == undefined) {
                                    $scope.premax = 2;
                                } else {
                                    var max = 1;
                                    for (var l in $scope.prelists) {
                                        if (parseInt(($scope.prelists)[l].prescriptionSn >= max)) {
                                            max = parseInt(($scope.prelists)[l].prescriptionSn);
                                        }
                                    }
                                    // console.log(max);
                                    $scope.premax = parseInt(max) + 1;
                                }
                            } else {
                                ZENG.msgbox.show(data.errorMessage, 1, 1500);
                            }
                        }).error(function () {
                            ZENG.msgbox.show(data.errorMessage, 5, 1500);
                        });
                    } else {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    }
                }).error(function (data) {
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                });
            }else{return;}
        }
         //展开历史处方
        $scope.isshowcf = false;
        $scope.showcflist = function () {
            $scope.isshowcf = !$scope.isshowcf;
        };
        //展开选择药方
        $scope.showYf = function () {
            if ($scope.showMethod) {
                $scope.showMethod = false;
            } else {
                $scope.showMethod = true;
            }
        }
        //选择常用药方
        $scope.usYF = function (flag, type) {
            $scope.YFtype = type;
            $scope.seletem = 'usually';
            // console.info("调用常用药方");
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/mzsys/getPattern2?deptSn=' + $rootScope.studioHisId + '&doctorCode=' + $rootScope.docHisId + '&flag=' + flag
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                    $scope.suglist = data.roots;
                }
            }).error(function () {
                // console.log("error");
            });
            $scope.modal.show();
        }
        $scope.more = function (n) {
            $scope.seletem = "more";
            // console.log(n);
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPatternDetail?tsn=' + n.tsn
            }).success(function (data) {
                if (data) {
                    console.log(data);
                    $scope.cfdetails = data.roots;
                }
            }).error(function () {
                // console.log("error");
            });
        };
        //选择病人历史药方
        $scope.allYF = function () {
            $scope.seletem = 'history';
            //console.info("调用药方大全");
            if ($scope.showHis) {
                $scope.showHis = false;
            } else {
                $scope.showHis = true;
            }

            //"f8cc1dc05756865801575abca98a017e"
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=2&pid=' + $rootScope.sickId,
            }).success(function (data) {
                if (data) {
                    // console.info(data);

                    var cflists = data;
                    var cfes = [];
                    var chues = [];
                    for (i = 0; i < cflists.len; i++) {
                        var index = "list" + i;
                        var cfs = eval('(' + (cflists)[index].patient + ')');
                        cfes.push(cfs);
                        var chufs = eval('(' + (cflists)[index].preList + ')');
                        chues.push(chufs);
                    }

                    var cfList = [];
                    var datas = chues[0]; //因为带了id 应该是只有一条数据
                    for (var i = 0; i < datas.length; i++) {
                        cfList.push(datas[i]);
                    }
                    $rootScope.patientMess = cfes;
                    $rootScope.patientChufang = cfList;
                    // console.info(cfes);
                    // console.info(cfList);
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                // console.info(data)
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
        //存为常用药方
        newdiaglist = [];
        $scope.addMb = function () {
            // console.log(1);
            diaglist = locals.getObject("diaglist");
            for (var i in diaglist) {
                var string = diaglist[i].pyCode;
                if (string.substring(0, 1) == "A") {
                    newdiaglist.push(diaglist[i]);
                } else {
                    // console.log("2");
                }
            }
        };
        //调用模态窗口
        $ionicModal.fromTemplateUrl('templates/mxModal.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });
        //加载患者历史处方
        $scope.cfmx = function (yVal) {
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?flag=2&pid=' + yVal.pid + '&times=' + yVal.times + '&prescriptionSn=' + yVal.prescriptionSn,
            }).success(function (data) {
                if (data) {
                    $scope.showaddpre[arrindex].list.splice(0, $scope.showaddpre[arrindex].list.length);
                    $scope.showaddpre[arrindex].list = JSON.parse(data.list);
                    $scope.showchoose = $scope.showaddpre[arrindex];
                    $scope.totalPrice = sunTotal($scope.showchoose);
                    $scope.modal.hide();
                    $scope.s = false;
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
        //添加常用处方
        $scope.addcf = function (data) {
            $scope.showaddpre[arrindex].list.splice(0, $scope.showaddpre[arrindex].list.length);
            $scope.showaddpre[arrindex].list = data;
            $scope.showchoose = dataServComm.setDosageToFloat($scope.showaddpre[arrindex]);
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.modal.hide();
            $scope.s = false;
        }
        //点击搜素框自动全选
        $scope.sAll = function () {
            $("input[name='ycSearch']").select();
        }
        var ycsclist = {};
        var ycarray = [];
        //input值改变发起搜索
        $scope.serch = function (val) {
            // console.log(val);
            if (val == "") {
                $rootScope.findYc = [];
                $scope.showfYc = false;
            }
            if ($scope.scval == undefined) {
                if (val.length >= 2 || val.charCodeAt() > 255) {
                    val = val.toUpperCase();
                    $http({
                        method: 'get',
                        url: 'http://localhost/medicalsys/mzsys/getChargeItem?sValue=' + val,
                    }).success(function (data) {
                        if (data) {
                            // console.info(data);
                            $rootScope.findYc = data.roots;
                            $scope.showfYc = true;
                        } else {
                            ZENG.msgbox.show(data.errorMessage, 1, 1500);
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    });
                }
            } else {
                if (val.indexOf($scope.scval) != -1) {
                    for (i = 0; i < $rootScope.findYc.length; i++) {
                        if (val == $rootScope.findYc[i].pyCode) {
                            ycarray.push($rootScope.findYc[i]);
                        }
                    }
                    $rootScope.findYc = ycarray;
                    $scope.showfYc = true;
                }
            }
        }
        //加1
        $scope.plus = function (n) {
            if (n == undefined) {
                n = 0;
            } else {
                n = n + 1;
            }
            $scope.selectedyc.dosage = n;
        }
        //-1
        $scope.minus = function (n) {
            if (n == undefined) {
                n = 0;
            } else {
                n = +n - 1;
            }
            $scope.selectedyc.dosage = n;
        }
        //清空搜索框
        $scope.delMedic = function () {
            $scope.findYC = "";
            $scope.showfYc = false;
        }
        //寻找药材
        $scope.findMedic = function (val) {
            // console.info("寻找" + val);
            if (val == undefined || val == "") {
                $scope.showfYc = false;
            } else {
                val = val.toUpperCase();
                $http({
                    method: 'get',
                    url: 'http://localhost/medicalsys/mzsys/getChargeItem?sValue=' + val,
                }).success(function (data) {
                    if (data) {
                        // console.info(data);
                        $rootScope.findYc = data.roots;
                        $scope.showfYc = true;
                    } else {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    }
                }).error(function (data) {
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                });
            }
        }
        //选中的药材
        $scope.choseYc = function (yc) {
            // console.info("选中的药材" + yc.chargeName);
            if (yc.dosage == undefined) {
                yc.dosage = 5;
            }
            $scope.selectedyc = yc;
            var findex = arrindex;
            // console.log(nowindex);
            $scope.showfYc = false;
            //		$ionicScrollDelegate.scrollBottom();
            $scope.findYC = "";
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/medic.html",
                title: '添加药材',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '添加',
                    type: 'button-positive',
                    onTap: function (e) {
                        // 光标移至查询框
                        // $("#searchYC").attr('ng-onfocus',true);
                        $scope.getFocus();
                        return 2;
                    }
                },]
            });

            $scope.setBlur = function () {
                $scope.isFocus = false;
            }

            $scope.getFocus = function () {
                $scope.isFocus = true;
            };

            $rootScope.myPopup.then(function (res) {
                if (res) {
                    // 检查药材是否已经添加
                    if ($scope.checkIsAdd($scope.selectedyc)) return;
                    ($scope.showaddpre)[findex].list.push($scope.selectedyc);
                    $scope.showchoose = ($scope.showaddpre)[findex];
                    $scope.totalPrice = sunTotal($scope.showchoose);
                    $scope.allprice = $scope.alladd($scope.showaddpre);
                    // console.log($scope.allprice);
                }
            })
        }
        //编辑药材
        $scope.edityc = function (y) {
            $scope.selectedyc = y;
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/medic.html",
                title: '修改药材',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '修改',
                    type: 'button-positive',
                    onTap: function (e) {
                        return 2;
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    $scope.totalPrice = sunTotal($scope.showchoose);
                }
            })

        }
        $scope.editYC2 = function (y, dosage) {
            console.log(y);
            console.info(dosage);
            // $scope.selectedyc.dosage = dosage;
            $scope.totalPrice = sunTotal($scope.showchoose);
        }
        //删除药材
        $scope.delYC = function (ycVal) {
            if (confirm("确定删除该药材吗？")) {
                for (var x in ($scope.showaddpre)[arrindex].list) {
                    if ((($scope.showaddpre)[arrindex].list)[x].$$hashKey == ycVal.$$hashKey) {
                        ($scope.showaddpre)[arrindex].list.splice(x, 1);
                        break;
                    }
                }
                $scope.showchoose = ($scope.showaddpre)[arrindex];
                $scope.totalPrice = sunTotal($scope.showchoose);
                $scope.allprice = $scope.alladd($scope.showaddpre);
            }
        }
        // 删除所有已选药材
        $scope.delYCAll = function () {
            console.log($scope.showchoose);
            if ($scope.showchoose.list.length == 0 || $scope.showchoose.list.length == undefined) {
                alert('请先添加药材！');
                return;
            }
            if (confirm("确定删除所有已选药材吗？")) {
                ($scope.showaddpre)[0].list = [];
                $scope.showchoose = [];
                $scope.showchoose.list = [];
                $scope.totalPrice = 0;
            } else {return;}
        }
        //选择规格
        $scope.chooseval = function (n, $event) {
            $scope.selectedyc.dosage = n;
            $($event.target).parent().children().removeClass("cv");
            $($event.target).addClass("cv");
        }
        //添加草药数量(添加处方付数)
        $scope.addNum = function () {
            // console.log($scope.showchoose.list);
            if ($scope.showchoose.list == undefined) {
                ZENG.msgbox.show('请添加处方药材', 1, 1500);
                return;
            }
            $scope.yaoFangNumsArrTemp = $scope.yaoFangNumsArr;
            // console.log($scope.yaoFangNumsArrTemp);
            ($scope.showaddpre)[arrindex].herbalAmount++;
            $scope.herbalAmount = ($scope.showaddpre)[arrindex].herbalAmount;
            // $scope.herbalAmountq = ($scope.showaddpre)[arrindex].herbalAmount;
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }
        //减少草药数量(减少处方付数)
        $scope.decNum = function () {
            // console.log($scope.showchoose.list);
            if ($scope.showchoose.list == undefined) {
                ZENG.msgbox.show('请添加处方药材', 1, 1500);
                return;
            }
            $scope.yaoFangNumsArrTemp = $scope.yaoFangNumsArr;
            // console.info(($scope.showaddpre)[arrindex].herbalAmount);
            if (($scope.showaddpre)[arrindex].herbalAmount == 1) {
                ZENG.msgbox.show("总付数不能为0", 1, 1500);
            } else {
                ($scope.showaddpre)[arrindex].herbalAmount--;
                $scope.herbalAmount = ($scope.showaddpre)[arrindex].herbalAmount;
                // $scope.herbalAmountq = ($scope.showaddpre)[arrindex].herbalAmount;
            }
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }
        $scope.changePreNum = function (changePreNum) {//监听下拉框付数的选择并将其同步到原来的($scope.showaddpre)[arrindex].herbalAmount的属性
            // console.log("changePreNum="+changePreNum);
            if (changePreNum == null) {
                // return;
                changePreNum = ($scope.showaddpre)[arrindex].herbalAmount;
            }
            ($scope.showaddpre)[arrindex].herbalAmount = changePreNum;
            $scope.herbalAmount = changePreNum;
            // $scope.herbalAmountq = changePreNum;
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }
        //计算总价
        var sunTotal = function (chooseYc) {
            var faltotal = 0;
            for (var i = 0; i < chooseYc.list.length; i++) {
                //console.info(chooseYc[i].chargeAmount);
                if ((chooseYc.list)[i].dosage == undefined) {
                    return faltotal;
                }
                if ((chooseYc.list)[i].origPrice != null || undefined) {
                    var mc = parseFloat((chooseYc.list)[i].origPrice) * parseFloat($scope.herbalAmount) * parseFloat((chooseYc.list)[i].dosage);
                    faltotal += mc;
                }
            }
            return faltotal;
        }
        $scope.alladd = function (chs) {
            var allp = 0;
            for (var g = 0; g < chs.length; g++) {
                var addpreprice = sunTotal(chs[g]);
                allp = allp + addpreprice;
            }
            return allp;
        }
        //数量改变，价格相应改变
        $scope.changeTotal = function () {
            $scope.totalPrice = sunTotal($scope.showchoose);
        }
        //查询用法？
        $scope.howtouse = function (n) {
            // console.log(n);
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getDicSupply'
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                } else {
                    // console.log("unusual")
                }
            }).error(function () {
                // console.log("error");
            });
        };
        //显示相应处方
        $scope.showhat = function ($index, $event) {
            $($event.target).parent().children().css("color", "white").css("background-color", "#6FAF8C").css("border-right", "solid 1px white");
            $($event.target).css("color", "black").css("background-color", "white");
            $scope.showchoose = ($scope.showaddpre)[$index];
            $scope.herbalAmount = ($scope.showaddpre)[$index].herbalAmount;
            $scope.totalPrice = sunTotal($scope.showchoose);
            arrindex = $index;
            // console.log(arrindex);
        }
        //增加新的处方
        $scope.addanothercf = function () {
            $("#showpre").children().css("color", "white").css("background-color", "#6FAF8C").css("border-right", "solid 1px white");
            nowindex++;
            arrindex = nowindex;
            // console.log(arrindex);
            ($scope.showaddpre)[arrindex] = [];
            ($scope.showaddpre)[arrindex].list = [];
            ($scope.showaddpre)[arrindex].herbalAmount = 1;
            $scope.herbalAmount = ($scope.showaddpre)[arrindex].herbalAmount;
            $scope.showchoose = ($scope.showaddpre)[arrindex];
            $scope.totalPrice = 0;
        };
        //删除某个处方
        $scope.deletecf = function ($index, $event) {
            $("#showpre").children().css("color", "white").css("background-color", "#6FAF8C").css("border-right", "solid 1px white");
            $("#showpre").children().first().css("color", "black").css("background-color", "white");
            window.event ? window.event.cancelBubble = true : e.stopPropagation();
            $scope.showaddpre.splice($index, 1);
            if (nowindex == 0) {
                nowindex = 0;
                $scope.showaddpre[0] = [];
                $scope.showaddpre[0].list = [];
                $scope.showaddpre[0].herbalAmount = 1;
            } else {
                nowindex--;
            }
            arrindex = 0;
            $scope.showchoose = ($scope.showaddpre)[arrindex];
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }
        //提交用药建议
        $scope.overSug = function () {
            var chooseArr = [];
            var chooseJson = {};
            $rootScope.chooseYc = [];
            for (var o = 0; o < $scope.showaddpre.length; o++) {
                for (var p = 0; p < ($scope.showaddpre)[o].list.length; p++) {
                    // ($scope.showaddpre[o].list)[p].prescriptionSn = $scope.premax + o;
                    ($scope.showaddpre[o].list)[p].prescriptionSn = $scope.premax;
                    ($scope.showaddpre[o].list)[p].detaiSn = p + 1;
                    ($scope.showaddpre[o].list)[p].herbalAmount = $scope.showaddpre[o].herbalAmount;
                    $rootScope.chooseYc.push(($scope.showaddpre[o].list)[p]);
                }
            }
            if ($rootScope.chooseYc.length == 0) {
                ZENG.msgbox.show("请添加处方", 1, 1500);
                return;
            }
            for (var i = 0; i < $rootScope.chooseYc.length; i++) {
                chooseJson = {}; //每次只提交一条数据给数组，所以每次要置空。
                chooseJson['pid'] = $rootScope.hisId; // 病人ID
                chooseJson['times'] = $rootScope.times; //就诊次数
                chooseJson['prescriptionSn'] = $scope.thisPrescriptionSn; // 处方序号
                chooseJson['detaiSn'] = $rootScope.chooseYc[i].detaiSn;
                chooseJson['chargeCode'] = $rootScope.chooseYc[i].chargeCode;
                chooseJson['serialNo'] = $rootScope.chooseYc[i].serialNo;
                chooseJson['groupNo'] = $rootScope.chooseYc[i].groupNo;
                chooseJson['recordOpera'] = $rootScope.docHisId;
                chooseJson['chargeAmount'] = $rootScope.chooseYc[i].dosage;
                // chooseJson['herbalAmount'] = parseInt($scope.herbalAmount);
                chooseJson['herbalAmount'] = parseInt($rootScope.chooseYc[i].herbalAmount);
                chooseJson['dosage'] = $rootScope.chooseYc[i].dosage;
                chooseJson['dosageUnit'] = $rootScope.chooseYc[i].dosageUnit;
                chooseJson['supplyCode'] = $rootScope.chooseYc[i].supplyCode;
                chooseJson['freqCode'] = "";
                chooseJson['persistDays'] = null;
                if($rootScope.chooseYc[i].comment==null || $rootScope.chooseYc[i].comment == 'null' || $rootScope.chooseYc[i].comment == undefined){
                    $rootScope.chooseYc[i].comment = '';
                }
                chooseJson['comment'] = $rootScope.chooseYc[i].comment;
                chooseJson['applyDept'] = $rootScope.studioHisId

                //console.info(chooseJson);
                chooseArr.push(chooseJson);
            }
            // console.info(chooseArr);

            var arryJson = {};
            arryJson['detailList'] = chooseArr;
            var detailList = JSON.stringify(arryJson);
            console.log(detailList);

            //传给预览的数据
            $rootScope.falTotalPrice = $scope.totalPrice;
            $rootScope.falHerbalAmount = $scope.herbalAmount;

            $http({
                method: 'POST',
                url: 'http://localhost/medicalsys/mzsys/AddAppDetail',
                data: detailList
            }).success(function (data) {
                console.info(data)
                if (data.success) {
                    $location.path("/app/showsug");
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                console.info(data);
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
            // $location.path("/app/showsug");
        }
        //取消看诊
        $scope.qxSeeDot = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/mzsys/updateClinicRoom?roomId=000|000|000&updateFlag=1&flag=&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&doctorCode=' + $rootScope.docHisId + '&patientId=' + $rootScope.sickId + '&userType=1&orderId=' + $rootScope.orderida,
            }).success(function (data) {
                if (data.success) {
                    // console.info(data);
                    ZENG.msgbox.show("取消看诊", 1, 1500);
                    var now = new Date();
                    var yynow = $filter('date')(now, 'yyyy-MM-dd');
                    drdate = now.getTime();
                    $http({
                        method: 'get',
                        url: 'http://localhost/medicalsys/orders/orderinfo/getAppOrderPageList?type=0&_dc=' + drdate + '&page=1&start=0&limit=20&userId=' + $rootScope.loginUserId + '&startTime=' + yynow + '&endTime=' + yynow + '&status=2',
                    }).success(function (datas) {
                        if (datas.success) {
                            // console.info(datas);
                            var data = datas.roots;
                            var orderList = [];
                            for (var i = 0; i < data.length; i++) {
                                orderList.push(data[i]);
                            }
                            $rootScope.orderList = orderList;
                            $location.path("/app/dotorder");
                        } else {
                            // console.info(datas);
                        }
                    }).error(function () {
                        ZENG.msgbox.show("系统出错", 5, 1500);
                    });

                } else {
                    // console.info(data);
                    // console.info('上传失败！');
                }
            }).error(function (data) {
                // console.info(data);
                // console.log('error');
            });
        }
        // 从医生常开药材中选
        $scope.choseYc2 = function (yc) {
            console.info(yc);
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getChargeItem?sValue=' + yc.primName,
            }).success(function (data) {
                if (data) {
                    // console.info(data);
                    if (data.roots[0].dosage == undefined) {
                        data.roots[0].dosage = 5;
                    }
                    $scope.selectedyc = data.roots[0];
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
            var findex = arrindex;
            // console.log(nowindex);
            $scope.showfYc = false;
            //		$ionicScrollDelegate.scrollBottom();
            $scope.findYC = "";
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/medic.html",
                title: '添加药材',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '添加',
                    type: 'button-positive',
                    onTap: function (e) {
                        // 光标移至查询框
                        // $("#searchYC").attr('ng-onfocus',true);
                        $scope.getFocus();
                        return 2;
                    }
                },]
            });

            $scope.setBlur = function () {
                $scope.isFocus = false;
            }

            $scope.getFocus = function () {
                $scope.isFocus = true;
            };

            $rootScope.myPopup.then(function (res) {
                if (res) {
                    // 检查药材是否已经添加
                    if ($scope.checkIsAdd($scope.selectedyc)) return;
                    ($scope.showaddpre)[findex].list.push($scope.selectedyc);
                    $scope.showchoose = ($scope.showaddpre)[findex];
                    $scope.totalPrice = sunTotal($scope.showchoose);
                    $scope.allprice = $scope.alladd($scope.showaddpre);
                    // console.log($scope.allprice);
                }
            })

        }
        $scope.backToSugUse2 = function () {
            $location.path('/app/sugUse2');
        }
        // 检查药材是否已经添加
        $scope.checkIsAdd = function (selectedyc) {
            for (var i in $scope.showchoose.list) {
                if (selectedyc.chargeCode === $scope.showchoose.list[i].chargeCode) {
                    ZENG.msgbox.show(selectedyc.chargeName + ' 已经添加！', 1, 1500);
                    return true;
                }
            }
            return false;
        }
        function organizeData(data) {
            // 整理多个药材时的数据
            if (data == '' || data == undefined) {
                return '';
            }
            var YPtempDatas = []; // 药材
            for (var i = 0; i < data.length; i++) { // 处理开了多种药材
                var temp = {};
                temp['chargeCode'] = data[i].chargeCode; // 药材编号
                temp['chargeName'] = data[i].chargeName; // 药材名称
                temp['dosage'] = data[i].dosage; // 药材数量
                temp['supplyName'] = data[i].supplyName; // 药材用法
                temp['comment'] = data[i].comment; // 药材特殊用法
                temp['price'] = data[i].price; // 药材总计
                temp['origPrice'] = data[i].origPrice; // 药材单价
                temp['herbalAmount'] = data[i].herbalAmount; // 处方付数
                temp['serialNo'] = data[i].serialNo; //
                temp['groupNo'] = data[i].groupNo; //
                temp['dosageUnit'] = data[i].dosageUnit; //
                temp['supplyCode'] = data[i].supplyCode; //
                YPtempDatas[i] = temp;
            }
            YPtempDatas['herbalAmount'] = data[0].herbalAmount;
            $scope.predetails = data[0];
            $scope.predetails['yc'] = YPtempDatas
        }
        function showCFDetails() {
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/showCFDetails.html",
                title: '查看处方',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '返回',
                }]
            });
        }
        $scope.checkcf = function (item) {
            // console.log(item);
            // 获取病人历史处方详细
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + item.pid + '&times=' + item.times + '&accountSn=0&prescriptionSn=' + item.prescriptionSn + '&flag=2&dataType=0'
            }).success(function (data) {
                // console.log(data);
                var objcf = data.list;
                var preLists = JSON.parse(objcf);
                // console.log(preLists);
                // 整理数据
                if (organizeData(preLists)) {
                    ZENG.msgbox.show('此处方没有相关数据！', 5, 1500);
                    return;
                };
                showCFDetails();
            }).error(function (data) {
                // console.log(data);
            })
        }
        $scope.addlastCF = function (item) {
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + item.pid + '&times=' + item.times + '&accountSn=0&prescriptionSn=' + item.prescriptionSn + '&flag=2&dataType=0'
            }).success(function (data) {
                // console.log(data);
                var objcf = data.list;
                var preLists = JSON.parse(objcf);
                if (organizeData(preLists)) {
                    ZENG.msgbox.show('此处方没有相关数据！', 5, 1500);
                    return;
                };
                $scope.addcf($scope.predetails.yc);
            }).error(function (data) {
                ZENG.msgbox.show('获取数据失败！', 5, 1500);
            })
        }
    })
    // 患者管理
    .controller('pmCtrl',function ($scope, $rootScope, $http, $location, $filter, loadingService) {
        $scope.isSelectAll = false;
        $scope.isShowSearch = false;// 是否显示搜索栏
        $scope.isSelArr = [];// 记录病人选择记录
        $scope.haveDatas = true; // 标识下拉时是否有记录获取
        $scope.showDatas = [];
        var page = 1, start = 0, limit = 5;
        // 获取所有的就诊记录
        $scope.allDoctor = function (page, start, limit) {
            var now = new Date();
            var today = $filter('date')(now, 'yyyy-MM-dd');
            var startDate = '2017-03-01'; // 默认开始日期为开业那天
            // var newday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
            // var day5 = $filter('date')(newday, 'yyyy-MM-dd');
            drdate = now.getTime();
            loadingService.showLoading();
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/orders/orderinfo/getAppOrderPageList?type=0&userType=1&_dc=' + drdate + '&page=' + page + '&start=' + start + '&limit=' + limit + '&userId=' + $rootScope.loginUserId + '&startTime=' + startDate + '&endTime=' + today,
            }).success(function (datas) {
                if (datas.success) {
                    if (datas.roots[0] == undefined) {
                        $scope.haveDatas = false;
                        loadingService.hideLoading();
                        return;
                    }
                    var data = datas.roots;
                    if ($scope.showDatas.length != 0) { // 合并数组
                        $scope.showDatas = $scope.showDatas.concat(data);
                    } else {
                        $scope.showDatas = data;
                    }
                    $scope.allPar = $scope.showDatas;
                    loadingService.hideLoading();
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                } else {
                    ZENG.msgbox.show(datas.errorMessage, 5, 1500);
                    loadingService.hideLoading();
                }
            }).error(function () {
                ZENG.msgbox.show("系统出错", 5, 1500);
                loadingService.hideLoading();
            });
        }
        $scope.allDoctor(page, start, limit);

        $scope.loadNextPage = function () {
            page = page + 1;
            start = start + limit;
            $scope.allDoctor(page, start, limit);
        }

        $scope.orderMess = function (order) {
            $rootScope.cOrderMess = order;
            $rootScope.sickId = order.binrId;
            $rootScope.docHisId = order.docHisId;

            $rootScope.studioHisId = order.studioHisId;
            $rootScope.times = order.times || 1;
            if (order.dstatus == '5') {
                $rootScope.isgo = false;
            } else {
                $rootScope.isgo = true;
            }

            //用于预览的回显
            $rootScope.orderida = order.id;
            $rootScope.falSickName = order.binrName;
            $rootScope.falSickSex = order.binrSex;
            $rootScope.falSickAge = order.binrAge;
            $rootScope.falSickPid = order.phisId;

            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/empPatient/attchements/getBrCheckLists?patientId=' + $rootScope.sickId + "&userType=0&orderId=" + order.id,
            }).success(function (datas) {
                if (!datas.success) {
                    // console.info(datas);
                } else {
                    // console.info(datas);
                    //获取病人的病理特征
                    if (datas.roots.length == 0) {
                        $rootScope.sickMessage = '患者无上传任何病情描述';
                        $rootScope.orderId = '';
                        $rootScope.patientId = '';
                        $rootScope.hisId = '';
                        //$rootScope.times = datas.roots[0].times;
                        $rootScope.reserId = '';
                    } else {
                        if (datas.roots[0].remark == 'undefined' || datas.roots[0].remark == "" || datas.roots[0].remark == undefined) {
                            $rootScope.sickMessage = "患者无上传任何病情描述";
                        } else {
                            $rootScope.sickMessage = datas.roots[0].remark;
                        }
                        $rootScope.orderId = datas.roots[0].orderId;
                        $rootScope.patientId = datas.roots[0].patient.id;
                        $rootScope.hisId = datas.roots[0].patient.hisId;
                        //$rootScope.times = datas.roots[0].times;
                        $rootScope.reserId = datas.roots[0].id;
                    }

                    //picType  --图片类型1：检验，2：检查，3：其他
                    var sickMessList1 = [];
                    var sickMessList2 = [];
                    var sickMessList3 = [];

                    for (var i = 0; i < datas.roots.length; i++) {
                        if (datas.roots[i].path != undefined) {
                            if (datas.roots[i].type == 1) {
                                var imgPath = datas.roots[i].path;
                                imgPath = imgPath.replace("\\", "/");
                                imgPath = "http://image.tcmtrust.com/" + imgPath;
                                sickMessList1.push(imgPath);
                            } else if (datas.roots[i].type == 2) {
                                var imgPath = datas.roots[i].path;
                                imgPath = imgPath.replace("\\", "/");
                                imgPath = "http://image.tcmtrust.com/" + imgPath;
                                sickMessList2.push(imgPath);
                            } else if (datas.roots[i].type == 3) {
                                var imgPath = datas.roots[i].path;
                                imgPath = imgPath.replace("\\", "/");
                                imgPath = "http://image.tcmtrust.com/" + imgPath;
                                sickMessList3.push(imgPath);
                            }
                        }
                    }
                    $rootScope.sickMessList1 = sickMessList1;
                    $rootScope.sickMessList2 = sickMessList2;
                    $rootScope.sickMessList3 = sickMessList3;
                    $location.path("/app/sickmess");
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
        // $scope.selectAll = function (data) { // 全选患者(现在没有用到)
        //     $scope.isSelectAll = !$scope.isSelectAll;
        //     if (data.length==0 || data.length == undefined){
        //         return;
        //     }else{
        //         if($scope.isSelectAll){ // 全选
        //             for(var i=0;i<data.length;i++){
        //                 $scope.isSelArr[i] = 1;
        //             }
        //         }else{
        //             for(var i=0;i<data.length;i++){
        //                 $scope.isSelArr[i] = 0;
        //             }
        //         }
        //     }
        // }
        // $scope.selItem = function (index,val) { // 选择某一位患者(现在没有用到)
        //     if(val && $scope.isSelectAll){
        //         $scope.isSelectAll = false;
        //     }
        //     for(var i=0;i<$scope.isSelArr.length;i++){
        //         if (i == index){
        //             $scope.isSelArr[index] = !val;
        //             break;
        //         }
        //     }
        // }
        $scope.searchP = function () {
            $scope.isShowSearch = !$scope.isShowSearch;
            $scope.searchVal = '';
        }
        $scope.search = function (type) {
            $scope.showDatas = [];
            $scope.isSelectAll = false;
            $scope.isSelArr = [];
            if (type === 'string') {
                for (var i = 0; i < $scope.allPar.length; i++) {
                    if ($scope.allPar[i].binrName.indexOf($scope.searchVal) >= 0) {
                        $scope.showDatas.push($scope.allPar[i]);
                    }
                }
            } else if (type === 'date') {
                for (var i = 0; i < $scope.allPar.length; i++) {
                    if ($scope.allPar[i].reserDate.indexOf($scope.searchVal) >= 0) {
                        $scope.showDatas.push($scope.allPar[i]);
                    }
                }
            }
        }
        $scope.selectDate = function () {
            var searchDate = $filter('date')($scope.searchDate, 'yyyy-MM-dd');
            $scope.searchVal = searchDate;
            $scope.search('date');
        }
        //点击搜素框自动全选
        $scope.selInpAll = function () {
            $('#searchInp').select();
            // $("input[name='searchInp']").select();
        }
        $scope.clearSearchVal = function () {
            $scope.searchVal = '';
        }
    })
    // 地址与收费
    .controller('AACController',function ($scope, $rootScope, $http, $ionicModal, $ionicPopup) {
        // 获取工作室地址
        $scope.loadAddrMess = function () {
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByDocId'
            }).success(function (data) {
                console.log(data);
                $scope.addrMess = data.list;
            }).error(function (data) {
                console.log(data);
            });
        }
        $scope.loadAddrMess();

        $scope.adadd = function () {
            $scope.ad = {};
            $scope.ad.status = 0;
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/adpop.html",
                title: '添加工作室地址',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '保存',
                    type: 'button-positive',
                    onTap: function (e) {
                        var x;
                        if ($scope.ad.name == undefined || $scope.ad.name == "") {
                            ZENG.msgbox.show("请填写地址简称", 1, 1500);
                            e.preventDefault();
                            return x;
                        }
                        if ($scope.ad.phone == undefined || $scope.ad.phone == "") {
                            ZENG.msgbox.show("请填写预约电话", 1, 1500);
                            e.preventDefault();
                            return x;
                        }
                        if ($scope.ad.address == undefined || $scope.ad.address == "") {
                            ZENG.msgbox.show("请填写出诊地址", 1, 1500);
                            e.preventDefault();
                            return x;
                        }
                        else {
                            return 1;
                        }
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    $http({
                        method: 'post',
                        url: 'http://localhost/medicalsys/doctors/studioAddress/saveOrUpdate',
                        data: $.param($scope.ad),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).success(function (data) {
                        if (data) {
                            ZENG.msgbox.show(data.result, 1, 1500);
                            $scope.loadAddrMess();
                        } else {
                            // console.log("添加失败");
                        }
                    }).error(function () {
                        // console.log("系统错误");
                    });
                }
            });
        }
        $scope.adedit = function (item) {
            // console.log(item);
            $scope.ad = {};
            $scope.ad.id = item.id;
            $scope.ad.version = "";
            $scope.ad.name = item.name;
            $scope.ad.phone = item.phone;
            $scope.ad.status = 0;
            $scope.ad.address = item.address;
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/adpop.html",
                title: '编辑你的工作室地址',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '保存',
                    type: 'button-positive',
                    onTap: function (e) {
                        var x;
                        if ($scope.ad.name == undefined || $scope.ad.name == "") {
                            ZENG.msgbox.show("请填写地址简称", 1, 1500);
                            e.preventDefault();
                            return x;
                        }
                        if ($scope.ad.phone == undefined || $scope.ad.phone == "") {
                            ZENG.msgbox.show("请填写预约电话", 1, 1500);
                            e.preventDefault();
                            return x;
                        }
                        if ($scope.ad.address == undefined || $scope.ad.address == "") {
                            ZENG.msgbox.show("请填写出诊地址", 1, 1500);
                            e.preventDefault();
                            return x;
                        }
                        else {
                            return 1;
                        }

                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    $http({
                        method: 'post',
                        url: 'http://localhost/medicalsys/doctors/studioAddress/saveOrUpdate',
                        data: $.param($scope.ad),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).success(function (data) {
                        if (data) {
                            ZENG.msgbox.show(data.result, 1, 1500);
                            $scope.loadAddrMess();
                        } else {
                            ZENG.msgbox.show("获取数据失败", 1, 1500);
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    });
                }
            });
        }
        $scope.delad = function (item) {
            // console.log(item);
            $scope.ad = item;
            $rootScope.myPopup = $ionicPopup.confirm({
                template: "此操作不可恢复，确定？",
                title: '删除地址',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '确定',
                    type: 'button-positive',
                    onTap: function (e) {
                        return 2;
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res == 2) {
                    $http({
                        method: 'post',
                        url: 'http://localhost/medicalsys/doctors/studioAddress/delStudioAddress?id=' + item.id
                    }).success(function (data) {
                        if (data) {
                            ZENG.msgbox.show(data.result, 1, 1500);
                            $scope.loadAddrMess();
                        } else {
                            ZENG.msgbox.show(data.result, 1, 1500);
                            // console.log("删除失败");
                        }
                    }).error(function () {
                        // console.log("系统错误");
                    });
                }
            });
        };

        $scope.saveFee = function () {
            $scope.stu = {};
            $scope.adridarrcopy = [];
            adrsarrstr = "";
            $scope.stu.id = $rootScope.dotList[0].id;
            $scope.stu.version = "";
            $scope.stu.code = $rootScope.dotList[0].code;
            $scope.stu.name = $rootScope.dotList[0].name;
            $scope.stu.firstdiagnosis = $scope.firstdiagnosis;
            $scope.stu.treatmentfee = $scope.treatmentfee;
            $scope.stu.status = $rootScope.dotList[0].status;
            $scope.stu.showindex = "";
            if ($rootScope.dotList[0].addressIds == undefined) {
                $scope.adridarr = [];
            } else {
                $scope.adridarr = $rootScope.dotList[0].addressIds;
            }
            for (i = 0; i < $scope.adridarr.length; i++) {
                m = "&addressIds=" + ($scope.adridarr)[i];
                $scope.adridarrcopy.push(m);
            }
            for (var i = 0; i < $scope.adridarr.length; i++) {
                for (var j = 0; j < $scope.addrMess.length; j++) {
                    if (($scope.adridarr)[i] == ($scope.addrMess)[j].id) {
                        ($scope.addrMess)[j].checked = true;
                        break;
                    }
                }
            }
            paramstr = $.param($scope.stu) + adrsarrstr;
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studio/saveStudio',
                data: paramstr,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                if (data) {
                    ZENG.msgbox.show(data.result, 1, 1500);
                    $http({
                        method: 'get',
                        url: 'http://localhost/medicalsys/doctors/studio/getStudioListByAccountId?zdoctor=' + $rootScope.zdcid,
                    }).success(function (data) {
                        if (data) {
                            // console.info(data);
                            $scope.dotList = data.list;
                        } else {
                            ZENG.msgbox.show("获取数据失败", 1, 1500);
                        }
                    }).error(function (data) {
                        // console.info(data);
                        ZENG.msgbox.show("系统出错", 5, 1500);
                    });
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                // console.log(data);
                ZENG.msgbox.show(data.erroMsg, 1, 1500);
            });
        }
    })
    .factory('dateService', function () {
        return {
            // 获取当前日期的前n天的日期
            getBeforeDate: function (n) {
                var n = n;
                var d = new Date();
                var year = d.getFullYear();
                var mon = d.getMonth() + 1;
                var day = d.getDate();
                if (day <= n) {
                    if (mon > 1) {
                        mon = mon - 1;
                    }
                    else {
                        year = year - 1;
                        mon = 12;
                    }
                }
                d.setDate(d.getDate() - n);
                year = d.getFullYear();
                mon = d.getMonth() + 1;
                day = d.getDate();
                s = year + "-" + (mon < 10 ? ('0' + mon) : mon) + "-" + (day < 10 ? ('0' + day) : day);
                return s;
            },
            // 格式化日期格式为yyyymmdd
            fomatDate: function (date) {
                var day = date;
                var Year = 0;
                var Month = 0;
                var Day = 0;
                var CurrentDate = "";
                Year = day.getFullYear();
                Month = day.getMonth() + 1;
                Day = day.getDate();
                CurrentDate += Year;
                if (Month >= 10) {
                    CurrentDate += Month;
                } else {
                    CurrentDate += "0" + Month;
                }
                if (Day >= 10) {
                    CurrentDate += Day;
                } else {
                    CurrentDate += "0" + Day;
                }
                return CurrentDate;
            },
            // 获取服务器当前时间
            getServerDate: function () {
                var d;
                $.ajax({
                    type: "OPTIONS", async: false, url: "/", complete: function (x) {
                        d = x.getResponseHeader("Date")
                    }
                });
                return d;
            },
            // 转换微信昵称
            code: function (str) {
                str = str.replace(/\\/g, "%");
                return unescape(str);
            }
        }
    })
    .factory('dataServComm', function () {
        return {
            // 避免实现药材克数的input（类型为number）报错，将$scope.showchoose.list中dosage的值改为float类型
            setDosageToFloat: function (data) {
                for (var i in data.list) {
                    data.list[i].dosage = parseFloat(data.list[i].dosage);
                }
                return data;
            }
        }
    })
    .factory('loadingService', function ($ionicLoading) {
        return {
            showLoading: function () {
                $ionicLoading.show({
                    templateUrl: 'templates/loading.html',
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    minWidth: 500,
                    showDelay: 0
                });
            },
            hideLoading: function () {
                $ionicLoading.hide();
            }
        }
    })
    .filter('valFilter', function () {
        return function (input, type) {
            switch (type) {
                case 'nickName':
                    input = input.replace(/\\/g, "%");
                    return unescape(input);
                    break;
                case 'zhenduan' :
                    if (input == '' || input == undefined || input == 'null' || input == null) {
                        return input = '未填写诊断';
                    } else {
                        return input;
                    }
                    break;
                case 'bingli' :
                    if (input == "" || input == undefined) {
                        return input = "未填写病历"
                    } else {
                        return input;
                    }
                    break;
                case 'dosage':
                    if (input == "" || input == undefined || input == 'undefined' || input==null) {
                        return input = 0
                    } else {
                        return input;
                    }
                    break;
                default :
                    if (input == ' ' || input == undefined || input == 'null' || input==null) {
                        return input = '无';
                    } else {
                        return input;
                    }
            }
        }
    })
    .directive('enlargePic', function () {//enlargePic指令名称，写在需要用到的地方img中即可实现放大图片
        return {
            restrict: "AE",
            link: function (scope, elem) {
                elem.bind('click', function ($event) {
                    var img = $event.srcElement || $event.target;
                    angular.element(document.querySelector(".mask"))[0].style.display = "block";
                    angular.element(document.querySelector(".bigPic"))[0].src = img.src;
                })
            }
        }
    })
    .directive('closePic', function () {
        return {
            restrict: "AE",
            link: function (scope, elem) {
                elem.bind('click', function ($event) {
                    angular.element(document.querySelector(".mask"))[0].style.display = "none";
                })
            }
        }
    })
    .service('numtostr',function(){
        this.fun=function(x){
            switch(x){
                case 1:return '一';break;
                case 2:return '二';break;
                case 3:return '三';break;
                case 4:return '四';break;
                case 5:return '五';break;
                case 6:return '六';break;
                case 0:return '日';break;
                case 7:return '日';break;
            }
        }
        this.fun1=function(x){
            switch(x){
                case 1:return 1;break;
                case 2:return 2;break;
                case 3:return 3;break;
                case 4:return 4;break;
                case 5:return 5;break;
                case 6:return 6;break;
                case 0:return 7;break;
                case 7:return 7;break;
            }
        }
    })
    .service('loadDatePbService', function ($rootScope, $http, $ionicLoading,numtostr) {
        //定义数组用于匹配星期相对应的id
        var now = new Date();
        var nowTime = now.getTime();
        var day = now.getDay();
        var oneDayLong = 24 * 60 * 60 * 1000;
        var MondayTime = nowTime - (day - 1) * oneDayLong;
        var today = new Date(nowTime);
        var wek1 = 'WEEK.' + numtostr.fun1(day);
        var wek2 = 'WEEK.' + numtostr.fun1((day + 1) > 7 ? (day + 1) - 7 : (day + 1));
        var wek3 = 'WEEK.' + numtostr.fun1((day + 2) > 7 ? (day + 2) - 7 : (day + 2));
        var wek4 = 'WEEK.' + numtostr.fun1((day + 3) > 7 ? (day + 3) - 7 : (day + 3));
        var wek5 = 'WEEK.' + numtostr.fun1((day + 4) > 7 ? (day + 4) - 7 : (day + 4));
        var wek6 = 'WEEK.' + numtostr.fun1((day + 5) > 7 ? (day + 5) - 7 : (day + 5));
        var wek7 = 'WEEK.' + numtostr.fun1((day + 6) > 7 ? (day + 6) - 7 : (day + 6));
        var dataweek = [{
            id: "xs1",
            name: wek1 + "上午"
        }, {
            id: "xs8",
            name: wek1 + "中午"
        }, {
            id: "xs15",
            name: wek1 + "下午"
        }, {
            id: "xs22",
            name: wek1 + "晚上"
        }, {
            id: "xs2",
            name: wek2 + "上午"
        }, {
            id: "xs9",
            name: wek2 + "中午"
        }, {
            id: "xs16",
            name: wek2 + "下午"
        }, {
            id: "xs23",
            name: wek2 + "晚上"
        }, {
            id: "xs3",
            name: wek3 + "上午"
        }, {
            id: "xs10",
            name: wek3 + "中午"
        }, {
            id: "xs17",
            name: wek3 + "下午"
        }, {
            id: "xs24",
            name: wek3 + "晚上"
        }, {
            id: "xs4",
            name: wek4 + "上午"
        }, {
            id: "xs11",
            name: wek4 + "中午"
        }, {
            id: "xs18",
            name: wek4 + "下午"
        }, {
            id: "xs25",
            name: wek4 + "晚上"
        }, {
            id: "xs5",
            name: wek5 + "上午"
        }, {
            id: "xs12",
            name: wek5 + "中午"
        }, {
            id: "xs19",
            name: wek5 + "下午"
        }, {
            id: "xs26",
            name: wek5 + "晚上"
        }, {
            id: "xs6",
            name: wek6 + "上午"
        }, {
            id: "xs13",
            name: wek6 + "中午"
        }, {
            id: "xs20",
            name: wek6 + "下午"
        }, {
            id: "xs27",
            name: wek6 + "晚上"
        }, {
            id: "xs7",
            name: wek7 + "上午"
        }, {
            id: "xs14",
            name: wek7 + "中午"
        }, {
            id: "xs21",
            name: wek7 + "下午"
        }, {
            id: "xs28",
            name: wek7 + "晚上"
        }]

        //需要的参数 x：工作室id  预约列表渲染
        this.xsFun = function (x, bt, et) {

            //加载动画0
            $ionicLoading.show({
                content: '加载中...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            console.info("选择的开始时间和结束时间：" + bt + ":" + et);
            //清空之前的排班
            for (var j = 0; j < dataweek.length; j++) {
                var s = angular.element(document.getElementById(dataweek[j].id));
                s[0].innerHTML = '';
                s[0].style.backgroundColor = "";
            }
            mydate = [];
            //加载这一周的排班情况
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/getScheduleDetailsList?startTime=' + bt + '&endTime=' + et + '&studioId=' + x + '&start=0&limit=300',
                header: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
            }).success(function (datas) {
                if (datas.success) {
                    console.info(datas);
                    for (var j = 0; j < datas.roots.length; j++) {
                        if ((datas.roots)[j].status != 5) {
                            mydate.push((datas.roots)[j]);
                        }
                    }

                    //回显到表格上。显示已经排班

                    for (var i = 0; i < mydate.length; i++) {
                        //获取到的是 “周一上午”
                        var pb = mydate[i].weekNum + "" + mydate[i].timeTypeText;
                        //周一 $scope.week1
                        console.info("需要渲染的时间段：" + pb); //周五下午

                        for (var j = 0; j < dataweek.length; j++) {
                            var s = angular.element(document.getElementById(dataweek[j].id));

                            //匹配的要渲染格子
                            if (pb == dataweek[j].name) {
                                var kyPerson = parseInt(mydate[i].reservationNum);
                                var yjPerson = parseInt(mydate[i].reservationedNum);
                                var surplus = parseInt(mydate[i].subReservationNum);//剩余预约
                                var reserText = s[0].innerHTML;
                                var reserNum = 0;
                                var reseredNum = 0;
                                if (mydate[i].status == 0) {
                                    if (reserText.indexOf('停诊') == -1 || reserText == '') {
                                        s[0].innerHTML += '停诊';
                                    }
                                    s[0].style.backgroundColor = "red";
                                } else {
                                    reserText.replace('停诊', '');
                                }

                                if (reserText && reserText.indexOf('停诊') == -1) {
                                    //var pos = reserText.indexOf('(');
                                    //var pos2 = reserText.indexOf(')');
                                    reserNum = reserText ? parseInt($rootScope.num.split('(')[0]) : 0;//parseInt(reserText.substr(0, pos)) : 0;
                                    reseredNum = reserText ? parseInt($rootScope.num.split('(')[1].split(')')[0]) : 0; //parseInt(reserText.substr(pos + 1, pos2)) : 0;
                                }
                                if (mydate[i].status == 1) { // 启用
                                    var ky = kyPerson + reserNum;
                                    var yj = yjPerson + reseredNum;

                                    if (s[0].innerHTML.indexOf('停诊') > -1) {
                                        $rootScope.num = ky + '(' + yj + ')';
                                        s[0].style.backgroundColor = "red";
                                    } else {
                                        $rootScope.num = ky + '(' + yj + ')';
                                    }

                                    //排班满员
                                    if (ky == yj) {
                                        s[0].style.backgroundColor = '#FFC900';
                                    } else if (ky != yj && s[0].innerHTML.indexOf('停诊') == -1) {
                                        s[0].style.backgroundColor = "#4cd964";
                                    }
                                }
                                if (s[0].innerHTML == '停诊') {

                                } else {
                                    s[0].innerHTML = parseInt($rootScope.num.split('(')[0]) - parseInt($rootScope.num.split('(')[1].split(')')[0]);//todo
                                }

                                console.info("最后字段:" + s[0].innerHTML);
                                //$scope.abc+=surplus;
                                console.log(surplus);
                                if (s[0].innerHTML == 0) {
                                    s[0].innerHTML = '已满';
                                }
                                break;
                            }
                        }
                    }
                    $rootScope.oneWeekRange = mydate;
                    console.info("调用服务请求某一周的排班数据");
                    console.info($rootScope.oneWeekRange);
                    //清空下面的选择项
                    $rootScope.tableChoose = "";
                    //关闭动画
                    $ionicLoading.hide();
                    return;
                } else {
                    console.info(datas);
                    //关闭动画
                    $ionicLoading.hide();
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                }
            }).error(function (datas) {
                console.info(datas);
                //关闭动画
                $ionicLoading.hide();
                ZENG.msgbox.show(datas.errorMessage, 5, 1500);
            });
        }
    })