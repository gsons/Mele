angular.module('starter.controllers', ['angularFileUpload'])
//formController 表单登录提交验证页面------登录操作
    .controller('formController', function ($scope, $rootScope, $http, $location, $ionicPopup, locals, docService, Alertbox, loadingService) {
        $scope.formData = {};
        $rootScope.aa = $scope.formData.accountId;
        var url = window.location.href;
        if (url.indexOf("message") != -1) {
            var query = decodeURIComponent(url.substring(url.indexOf('=') + 1));
            ZENG.msgbox.show(query, 1, 1500);
        }
        $scope.processForm = function () {
            if (!$scope.formData.username) {
                ZENG.msgbox.show("请填写账号", 1, 1500);
                return;
            }
            if (!$scope.formData.password) {
                ZENG.msgbox.show("请填写密码", 1, 1500);
                return;
            }
            //登录表单提交
            // console.info($scope.formData);
            $rootScope.aa = $scope.formData.username;
            // console.log($scope.formData.username);
            loadingService.showLoading();
            $http({
                method: 'POST',
                //登录验证的验证地址
                url: 'http://localhost/medicalsys/login',
                data: $.param($scope.formData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
                }
            }).success(function (datas) {
                if (!datas.success) {
                    //登录失败
                    loadingService.hideLoading();
                    if (datas.errorMessage == "用户已经登录") {
                        Alertbox.comfirm($scope.formData);
                    } else {
                        Alertbox.fno(datas.errorMessage);
                        locals.set("doclocallogged", false);
                        // console.info("退出，并注销local");
                    }
                } else {
                    //登录成功
                    loadingService.hideLoading();
                    if (datas.data.imgUrl == undefined) {
                        $rootScope.avatarurl = "images/myPhone.png";
                        $rootScope.docAvatarurl = "images/myPhone.png";
                    } else {
                        $rootScope.avatarurl = datas.data.imgUrl;
                        $rootScope.docAvatarurl = datas.data.imgUrl;
                    }
                    docService.docavatar = $rootScope.avatarurl;
                    locals.set("doclocalusername", $scope.formData.username);
                    locals.set("doclocalpassword", $scope.formData.password);
                    locals.set("doclocaluserid", datas.data.id);
                    locals.set("doclocallogged", true);
                    // 用户信息
                    $rootScope.rootUserdatas = datas.data;
                    // console.info($rootScope.rootUserdatas);
                    //返回用户id
                    $rootScope.loginUserId = datas.data.id;
                    $rootScope.accountId = datas.data.accountId;
                    if (datas.data.openId == undefined || datas.data.openId == '' || datas.data.openId == 'null') {
                        ZENG.msgbox.show("用户尚未授权，将自动授权", 1, 1500);
                        location.href = 'http://localhost/medicalsys/paysys/wechat/oauthUser?accountId=' + datas.data.accountId + '&userType=3';
                    } else {
                        $location.path('/app/main');
                    }
                }
            }).error(function () {
                //登录错误
                $location.path('/app/login');
            });
        };

        $scope.forget = function () {
            $location.path('/app/forget');
        }

        $scope.loginalert = function () {
            $scope.lgbox = {
                username: '',
                password: '',
                userType: 1
            };
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: 'templates/loginbox.html',
                title: '请输入您的信息',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '登陆',
                    type: 'button-positive',
                    onTap: function (e) {

                        return 1;
                    }
                }, {
                    text: '注册',
                    type: 'button-positive',
                    onTap: function (e) {

                        return 2;
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res == 1) {
                    // console.info($scope.lgbox);
                    // console.log($scope.lgbox.username);
                    $http({
                        method: 'POST',
                        url: 'http://localhost/medicalsys/login',
                        data: $.param($scope.lgbox),

                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Access-Control-Allow-Origin': '*'
                        }

                    }).success(function (datas) {
                        if (!datas.success) {
                            if (datas.errorMessage == "用户已经登录") {
                                Alertbox.comfirm($scope.lgbox);
                            } else {
                                ZENG.msgbox.show(data.errorMessage, 5, 1500);
                                docService.isLogged = false;
                                locals.set("doclocallogged", false);
                            }
                        } else {
                            if (datas.data.openId == undefined || datas.data.openId == '' || datas.data.openId == 'null') {
                                ZENG.msgbox.show("用户尚未授权，将自动授权", 1, 1500);
                                location.href = 'http://localhost/medicalsys/paysys/wechat/oauthUser?accountId=' + datas.data.accountId + '&userType=3';
                            }
                            if (datas.data.imgUrl == undefined) {
                                $rootScope.avatarurl = "images/myPhone.png";
                            } else {
                                $rootScope.avatarurl = datas.data.imgUrl;
                            }
                            $rootScope.loginUserId = datas.data.id;
                            $rootScope.aa = $scope.lgbox.username;
                            // console.log(datas);
                            docService.isLogged = true;
                            locals.set("doclocallogged", true);
                            locals.set("doclocalusername", $scope.lgbox.username);
                            locals.set("doclocalpassword", $scope.lgbox.password);
                            locals.set("doclocaluserid", datas.data.id);
                            $location.path('/app/main');
                            $rootScope.isloged = locals.get("doclocallogged");
                        }
                        // console.info(datas);
                    }).error(function () {
                        $location.path('/app/login');
                        docService.isLogged = false;
                        locals.set("doclocallogged", false);
                        ZENG.msgbox.show("系统错误", 5, 1500);
                    });
                }
                if (res == 2) {
                    $location.path('app/signup');
                }
            });
        };
    })

    .factory('docService', [function () {
        var doctorinfo = {
            isLogged: false,
            docname: '',
            docavatar: '',
            studio: '',
            skills: ''
        };
        return doctorinfo;
    }])

    .factory('Alertbox', function ($rootScope, $http, $ionicPopup, $location, locals, docService) {
        return {
            fno: function (msg) {
                $rootScope.myPopup = $ionicPopup.alert({

                    title: '提示',

                    template: msg

                });
            },

            comfirm: function (n) {
                logindatas = n;
                logindatas.force = true;
                $rootScope.myPopup = $ionicPopup.confirm({
                    template: "用户已登录，确认继续？",
                    title: '提示',
                    buttons: [{
                        text: '取消'
                    }, {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function (e) {
                            return 1;
                        }
                    },]
                });
                $rootScope.myPopup.then(function (res) {
                    if (res) {
                        $http({
                            method: 'POST',
                            url: 'http://localhost/medicalsys/login',
                            data: $.param(logindatas),
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Access-Control-Allow-Origin': '*'
                            }
                        }).success(function (datas) {
                            if (datas.data.openId == undefined || datas.data.openId == '' || datas.data.openId == 'null') {
                                ZENG.msgbox.show("用户尚未授权，将自动授权", 1, 1500);
                                location.href = 'http://localhost/medicalsys/paysys/wechat/oauthUser?accountId=' + datas.data.accountId + '&userType=3';
                            }

                            if (datas.data.imgUrl == undefined) {
                                $rootScope.avatarurl = "images/myPhone.png";
                            } else {
                                $rootScope.avatarurl = datas.data.imgUrl;
                            }
                            $rootScope.aa = logindatas.username;
                            // console.log(datas);
                            docService.isLogged = true;
                            locals.set("doclocallogged", true);
                            locals.set("doclocalusername", logindatas.username);
                            locals.set("doclocalpassword", logindatas.password);
                            locals.set("doclocaluserid", datas.data.id);
                            $location.path('/app/main');
                            $rootScope.isloged = locals.get("doclocallogged");
                        }).error(function () {
                            // console.log("系统错误");
                        });
                    }
                });
            },
        };
    })

    //regController 注册页面
    .controller('regController', function ($scope, $http, $location, $ionicModal, $ionicPopup, $interval) {
        var parseJSON = new Object();
        var args = new Object();
        var url = window.location.href;
        if (url.indexOf("message") != -1) {
            var query = decodeURIComponent(url.substring(url.indexOf('=') + 1));
            ZENG.msgbox.show(query, 1, 1500);
        }
        $scope.reg = {};
        // 医生注册为 1
        $scope.reg.userType = "1";

        $scope.doreg = function () {
            /* LMJ 登录测试 */
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/sys/user/register',

                data: $.param($scope.reg),

                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (!datas.success) {
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                } else {
                    //alert('注册成功');
                    //$location.path('app/login');
                    location.href = "http://localhost/medicalsys/paysys/wechat/oauthUser?userType=1" + "&accountId=" + $scope.reg.accountId;
                }
            }).error(function (datas) {
                ZENG.msgbox.show(datas.errorMessage, 5, 1500);
            });
        };

        //发送验证码
        $scope.timer = "获取验证码";
        $scope.sendMobileCode = function (reg) {
            timers = 60;
            timePromise = undefined;
            //alert("发送验证码");
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/sys/user/getSmsCode?phone=' + $scope.reg.accountId,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (!datas.success) {
                    ZENG.msgbox.show(datas.errorMessage + "：发送的号码可能不存在", 1, 1500);
                    $interval.cancel(timePromise);
                    timePromise = undefined;
                    timers = 60;
                    $scope.timer = '重新获取';
                    $scope.btnDisabled = false;
                } else {
                    ZENG.msgbox.show('验证码已发送，请稍候', 1, 1500);
                }
            }).error(function (datas) {
                // console.info(datas);
            });

            timePromise = $interval(function () {
                if (timers <= 0) {
                    $interval.cancel(timePromise);
                    timePromise = undefined;
                    timers = 60;
                    $scope.timer = '重新获取';
                    $scope.btnDisabled = false;
                } else {
                    timers--;
                    $scope.timer = '重新获取' + timers + 's';
                    $scope.btnDisabled = true;

                }
            }, 1000, 100);
        };

        $ionicModal.fromTemplateUrl('myreg-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.agree = function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };

    })
    //忘记密码
    .controller('forgetController', function ($scope, $rootScope, $http, $location, $ionicPopup, $ionicModal, $interval) {
        $scope.fg = {};
        $scope.doforget = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/sys/user/forgetPassword',
                data: $.param($scope.fg),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (!datas.success) {
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                } else {
                    ZENG.msgbox.show(datas.result, 4, 1500);
                    $location.path("/app/login");
                }
            }).error(function (datas) {
                ZENG.msgbox.show(datas.errorMessage, 5, 1500);
            });
        };
        $scope.timer = "获取验证码";
        $scope.sendMobileCode = function (fg) {
            timers = 60;
            timePromise = undefined;
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/sys/user/getSmsCode?phone=' + $scope.fg.accountId,
            }).success(function (datas) {
                if (!datas.success) {
                    ZENG.msgbox.show(datas.errorMessage + "：发送的号码可能不存在", 1, 1500);
                    $interval.cancel(timePromise);
                    timePromise = undefined;
                    timers = 60;
                    $scope.timer = '重新获取';
                    $scope.btnDisabled = false;
                } else {
                    ZENG.msgbox.show('验证码已发送，请稍候', 4, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });

            timePromise = $interval(function () {
                if (timers <= 0) {
                    $interval.cancel(timePromise);
                    timePromise = undefined;
                    timers = 60;
                    $scope.timer = '重新获取';
                    $scope.btnDisabled = false;
                } else {
                    timers--;
                    $scope.timer = '重新获取' + timers + 's';
                    $scope.btnDisabled = true;
                }
            }, 1000, 100);

        };
    })
    // 医生信息提交，基本信息提交 dotMessController
    .controller('dotMessController', function ($scope, $rootScope, $http, $location, $state, $ionicPopup, $filter, docparam) {
        $scope.reg = {};
        docparam.getparam("DEPT").then(function (res) {
            if (res) {
                // console.log(res);
                $rootScope.deptlist = res.categoryType;
            }
        });

        docparam.getparam("PROFESSION").then(function (res) {
            if (res) {
                // console.log(res);
                $rootScope.professionlist = res.categoryType;
            }
        });

        //回显数据获取和处理
        var myDotMess = $rootScope.dotMess;
        // console.log(JSON.stringify(myDotMess));
        if (JSON.stringify(myDotMess) != "{}") {
            //准备第一屏回显的数据， 同时修改日期的回显格式
            var retbirthday = $filter('date')(myDotMess.birthday, 'yyyy-MM-dd');
            $scope.reg.birthday = new Date(retbirthday);
            $scope.reg.name = myDotMess.name;
            $scope.reg.sex = myDotMess.sex;
            $scope.reg.idcard = myDotMess.idcard;
            $scope.reg.phone = myDotMess.phone;
            $scope.reg.email = myDotMess.email;
            $scope.reg.homeaddress = myDotMess.homeaddress;
            $scope.reg.skills = myDotMess.skills;
            $scope.reg.profiles = myDotMess.profiles;
            $scope.reg.userId = myDotMess.userId;
            $scope.reg.id = myDotMess.id;
            //
            $scope.reg.studioId = myDotMess.studioId;
            $scope.reg.hospitalname = myDotMess.hospitalname;
            $scope.reg.deptId = myDotMess.deptId;
            $scope.reg.profession = myDotMess.profession;
            $scope.reg.technical = myDotMess.technical;
            $scope.reg.practiceplace = myDotMess.practiceplace;
            $scope.reg.practicearea = myDotMess.practicearea;
            $scope.reg.protocol = myDotMess.protocol;
            //准备第二屏回显的数据
            //$rootScope.xlStudioId = myDotMess.studioId;
            $rootScope.studioName2 = myDotMess.studioId;
            $rootScope.hospitalname2 = myDotMess.hospitalname;
            $rootScope.deptId2 = myDotMess.deptId;
            $rootScope.profession2 = myDotMess.profession;
            $rootScope.technical2 = myDotMess.technical;
            $rootScope.practiceplace2 = myDotMess.practiceplace;
            $rootScope.practicearea2 = myDotMess.practicearea;
            $rootScope.protocol2 = myDotMess.protocol;
            $rootScope.userID = myDotMess.userId;
            $rootScope.mydotId = myDotMess.id;
        } else {
            $scope.reg = {};
        }

        //第一屏基本信息提交操作
        $scope.dotMessReg = function () {
            //设置医生提交的姓名，为工作室名称服务
            $rootScope.myDotName = $scope.reg.name;
            var bit = $scope.reg.birthday;
            $scope.reg.birthday = $filter('date')(bit, 'yyyy-MM-dd');
            // console.info($.param($scope.reg));
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/saveOrUpdate',
                data: $.param($scope.reg),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (datas.success) {
                    // console.info(datas);
                    $rootScope.dotMessTow = datas;
                    $rootScope.mydotId = datas.data.id;
                    // console.info("第一屏提交到第二屏的id" + $rootScope.mydotId);
                    $rootScope.myname = datas.data.name;
                    $rootScope.mysex = datas.data.sex;
                    $rootScope.mybirthday = $filter('date')(datas.data.birthday, 'yyyy-MM-dd');
                    ;
                    $rootScope.myidcard = datas.data.idcard;
                    $rootScope.myphone = datas.data.phone;
                    $rootScope.myemail = datas.data.email;
                    $rootScope.myhomeaddress = datas.data.homeaddress;
                    $rootScope.myskills = datas.data.skills;
                    $rootScope.myprofiles = datas.data.profiles;
                    $rootScope.userID = datas.data.userId;

                    // console.info("获取传递的id：" + $rootScope.mydotId);

                    //进入工作室页面进行工作室加载  改动getStudioAllList
                    $http({
                        method: 'post',
                        url: 'http://localhost/medicalsys/doctors/studio/getDoctorStudioList',
                    }).success(function (data) {
                        if (data) {
                            // console.info(data);
                            //                      dotRooms = [];
                            //                      for(var i in data) {
                            //                          for(var j in data[i]) {
                            //                              if(isNaN(j)) break;
                            //                              dotRooms.push(data[i][j]);
                            //                          }
                            //                          break;
                            //                      };
                            //                      $rootScope.dotRooms = dotRooms;
                            $rootScope.dotRooms = data.roots;
                            //跳转到下一个页面
                            $location.path('/app/dotroom');
                        } else {
                            ZENG.msgbox.show("获取数据失败", 1, 1500);
                        }
                    }).error(function (data) {
                        // console.info(data)
                        ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    });
                } else {
                    // console.info(datas);
                    ZENG.msgbox.show('信息提交失败', 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        };

    })
    // 医生信息提交，工作室提交 dotRoomController
    .controller('dotRoomController', function ($scope, $rootScope, $http, $location, $state, $ionicPopup, $filter) {
        $scope.regroom = {};
        $http({
            method: 'post',
            url: 'http://localhost/medicalsys/doctors/doctorInfo/getDocStudioListByDocId?id=' + $rootScope.mydotId
        }).success(function (data) {
            if (data) {
                // console.log(data);
                $scope.inedroom = data.roots;
            } else {
                // console.log("出现异常");
            }
        }).error(function () {
            // console.log("出现错误");
        });

        var myDotMess2 = $rootScope.dotMessTow;
        if (myDotMess2 != null) {
            //第二屏数据回显
            $scope.regroom.studioName = $rootScope.studioName2;
            $scope.regroom.hospitalname = $rootScope.hospitalname2;
            $scope.regroom.deptId = $rootScope.deptId2;
            $scope.regroom.profession = $rootScope.profession2;
            $scope.regroom.technical = $rootScope.technical2;
            $scope.regroom.practiceplace = $rootScope.practiceplace2;
            $scope.regroom.practicearea = $rootScope.practicearea2;
            $scope.regroom.protocol = $rootScope.protocol2;
        }
        var strarr = [];
        var studiostr = "";
        $scope.addstudios = function (item) {
            // console.log(item);
            if (item.checked == true) {
                n = "&studioIds=" + item.id;
                strarr.push(n);
            } else {
                n = "&studioIds=" + item.id;
                for (var i = 0; i < strarr.length; i++) {
                    if (strarr[i] == n) {
                        strarr.splice(i, 1);
                    }
                }
            }
            // console.log(strarr);
            // console.log(studiostr);
        };
        $scope.addstudioshow = function () {
            $scope.studioshow = true;
        };

        //第二屏提交操作，工作室提交操作
        $scope.dotRoomReg = function () {
            for (j = 0; j < strarr.length; j++) {
                studiostr = studiostr + strarr[j];
            }
            // console.log(studiostr);
            $scope.regroom.id = $rootScope.mydotId;
            // console.info("第二屏提交的id" + $scope.regroom.id);
            $scope.regroom.name = $rootScope.myname;
            $scope.regroom.sex = $rootScope.mysex;
            $scope.regroom.birthday = $filter('date')($rootScope.mybirthday, 'yyyy-MM-dd');
            $scope.regroom.idcard = $rootScope.myidcard;
            $scope.regroom.phone = $rootScope.myphone;
            $scope.regroom.email = $rootScope.myemail;
            $scope.regroom.homeaddress = $rootScope.myhomeaddress;
            $scope.regroom.skills = $rootScope.myskills;
            $scope.regroom.profiles = $rootScope.myprofiles;
            $scope.regroom.userId = $rootScope.userID;
            //传是否管理者
            $scope.regroom.isStudioManger = 1;

            // console.info("最后一屏的参数");
            var paramstr = $.param($scope.regroom) + studiostr;
            // console.log(paramstr);
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/saveOrUpdate',
                data: paramstr,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (datas.success) {
                    // console.info(datas);
                    ZENG.msgbox.show('您的信息已成功提交', 4, 1500);
                    $scope.studioshow = false;
                    strarr = [];
                    studiostr = "";
                    $location.path("app/main");
                } else {
                    // console.info(datas);
                    ZENG.msgbox.show('信息提交失败', 1, 1500);
                    strarr = [];
                    studiostr = "";
                }
            }).error(function (datas) {
                // console.info(datas);
                ZENG.msgbox.show('系统错误', 5, 1500);
                strarr = [];
                studiostr = "";
            });
        };

        //创建医生工作室
        $scope.createroom = function () {

            $scope.adridarrcopy = [];
            $scope.stu = {};
            $scope.stu.id = "";
            $scope.stu.version = "";
            $scope.stu.code = "";
            $scope.stu.status = 1;
            $scope.stu.showindex = "";
            $scope.adridarr = [];
            adrsarrstr = "";

            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/stupop.html",
                title: '编辑你的工作室地址',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '保存',
                    type: 'button-positive',
                    onTap: function (e) {
                        return 2;
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    for (k = 0; k < $scope.adridarrcopy.length; k++) {
                        adrsarrstr = adrsarrstr + ($scope.adridarrcopy)[k];
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
                            // console.info("创建成功");
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
            });
        };
    })
    //mController  医生工作室   ///////////主页
    .controller('mController', function ($scope, $rootScope, $http, $location, $filter, loadDatePbService, locals, docService, Alertbox,dateService,$sce) {
        if ($rootScope.isloged == 'true') {
            // console.log("以保存但尚未登陆");
            doclcn = locals.get("doclocalusername", "");
            doclcw = locals.get("doclocalpassword", "");
            locals.set('localYC','');// 清空本地存储的处方药材
            $rootScope.loginUserId = locals.get("doclocaluserid");
            // console.log(doclcn + doclcw);
            $scope.doclcformData = {
                username: doclcn,
                password: doclcw,
                userType: 1
            };
            $http({
                method: 'POST',
                url: 'http://localhost/medicalsys/login',
                data: $.param($scope.doclcformData),

                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Origin': '*'
                }

            }).success(function (data) {
                if (data.success) {
                    if (data.data.openId == undefined || data.data.openId == '' || data.data.openId == 'null') {
                        ZENG.msgbox.show("用户尚未授权，将自动授权", 1, 1500);
                        location.href = 'http://localhost/medicalsys/paysys/wechat/oauthUser?accountId=' + data.data.accountId + '&userType=3';
                    }
                    if (data.data.imgUrl == undefined) {
                        $rootScope.avatarurl = "images/myPhone.png";
                    } else {
                        $rootScope.avatarurl = data.data.imgUrl;
                    }
                    docService.docavatar = $rootScope.avatarurl;
                    locals.set("doclocalusername", $scope.doclcformData.username);
                    locals.set("doclocalpassword", $scope.doclcformData.password);
                    locals.set("doclocaluserid", data.data.id);
                    docService.isLogged = true;
                    locals.set("doclocallogged", true);
                    // console.log("登陆成功");
                    $rootScope.aa = $scope.doclcformData.username;
                    $rootScope.loginUserId = data.data.id;
                } else {
                    if (data.errorMessage == "用户已经登录") {
                        Alertbox.comfirm($scope.doclcformData);
                    } else {
                        msg = data.errorMessage;
                        Alertbox.fno();
                        locals.set("doclocallogged", false);
                    }
                }
            }).error(function () {
                Alertbox.fno();
                locals.set("doclocallogged", false);
                // console.log("系统错误");
            });
        }
        $http({
            method: 'post',
            url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser',
        }).success(function (datas) {
            if (!datas.success) {
                // console.info(datas);
            } else {
                //console.info(datas);
                //跳转医生信息录取页面
                // console.info("获取之前保存的医生信息：");
                //返回的数据的，会有多条吗？现在只遍历出来第一条数据，进行回显，回显：查看和修改医生信息；
                // console.info(datas.roots);
                $rootScope.dcid = datas.roots[0].id;
                $rootScope.zdcid = datas.roots[0].id;
                $rootScope.studioId = datas.roots[0].studioId;
                docService.docname = datas.roots[0].name;
                docService.skills = datas.roots[0].skills;
                docService.studio = datas.roots[0].studioName;
            }
        }).error(function () {
            ZENG.msgbox.show('获取医生信息失败', 5, 1500);
        });
        //
        // var hei = window.innerHeight - 93;
        // $("#ctbox").css("height", hei + "px");
        $scope.loginForm = {};
        $scope.loginForm.id = $rootScope.loginUserId;
        //医生信息
        $scope.loadMess = function () {
            //进入医生信息录取页面,如果第一次进入获取不到值
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser',
            }).success(function (datas) {
                if (!datas.success) {
                    // console.info(datas);
                } else {
                    //console.info(datas);
                    //跳转医生信息录取页面
                    // console.info("获取之前保存的医生信息：");
                    //返回的数据的，会有多条吗？现在只遍历出来第一条数据，进行回显，回显：查看和修改医生信息；
                    // console.info(datas.roots);
                    $rootScope.dotMess = datas.roots[0];
                    $location.path('/app/dotmess');
                }
            }).error(function () {
                ZENG.msgbox.show("获取数据失败", 5, 1500);
            });
        };
        //检测是否有新信息
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/webchat/chatmsg/getDoctorStudioNoReadMessageList'
        }).success(function (data) {
            if (data) {
                // console.log(data);
                delete data.success;
                $rootScope.meslist = data.roots;
                for (var a in data.roots) {
                    if ((data.roots)[a].msgCount != 0) {
                        $rootScope.unread = 1;
                        break;
                    }
                }

            }
        }).error(function () {
            // console.log('error');
        });
        //医生工作室排班
        $scope.loadRange = function () {
            //进入页面之前，获取医生之前选择的工作室
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/doctors/studio/getStudioList',
            }).success(function (data) {
                if (data) {
                    // console.info(data);
                    dotSelectList = [];
                    for (var i = 0; i < data.list.length; i++) {
                        $rootScope.firstPb = data.list[0].id;
                        $rootScope.pbName = data.list[0].name;
                        dotSelectList.push(data.list[i]);
                    }
                    $rootScope.dotSelectList = dotSelectList;
                    // console.info($rootScope.dotSelectList);
                    $rootScope.tableChoose = "";
                    $location.path('/app/dotrange');
                } else {
                    ZENG.msgbox.show("获取数据失败", 1, 1500);
                }
            }).error(function (data) {
                // console.info(data);
                ZENG.msgbox.show("系统出错", 5, 1500);
            });
        }
        $scope.gototest = function () {
            $location.path('/app/test');
        }
        //医生预约病人
        $scope.loadOrder = function () {
            var now = new Date(dateService.getServerDate());
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
        }
        //主页的开建议方，没有做实现
        $scope.loadTestLoc = function () {

            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/doctors/studio/getStudioList',
            }).success(function (data) {
                if (data) {
                    // console.info(data);
                    dotSelectList = [];
                    for (var i in data) {
                        for (var j in data[i]) {
                            if (isNaN(j)) break;
                            dotSelectList.push(data[i][j]);
                        }
                        break;
                    }
                    ;
                    $rootScope.dotList = dotSelectList;
                    $location.path('/app/dotroomloc');
                } else {
                    ZENG.msgbox.show("获取数据失败", 1, 1500);
                }
            }).error(function (data) {
                // console.info(data)
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });

        }
        //医生聊天室
        $scope.loadChart = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studio/getDoctorStudioMessageList?id=' + $rootScope.loginUserId
            }).success(function (datas) {
                if (!datas.success) {
                    // console.info(datas);
                } else {
                    //$scope.drlists = datas;
                    // console.info("进入工作室获取列表之前")
                    // console.info(datas.roots);
                    $rootScope.drlists = datas.roots;

                    //跳转到工作室列表
                    $location.path('/app/drlist');
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        };
        /*新增 LMJ begin*/
        $scope.pManage = function () {
            $location.path('/app/pmanage')
        }
        $scope.fastPres = function () {
            $location.path('/app/fastPres')
        }
        $scope.myCircle = function () {
            // 加载医生工作室信息
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser',
            }).success(function (datas) {
                if (datas.success){
                    $rootScope.dotMess = datas.roots[0];
                    // 跳转圈子页面
                    var cDate = dateService.fomatDate(new Date());
                    var Atoken = $rootScope.aa + "zcjk" + cDate;
                    Atoken = MD5(MD5(Atoken));
                    // 连接圈子
                    $rootScope.circleUrl = $sce.trustAsResourceUrl("http://quanzi.tcmtrust.com/mobi/wxcircledetail.html?Ausername=" +
                        $rootScope.aa + "&studioId=" + $rootScope.dotMess.id + "&studioName=" + $rootScope.dotMess.studioName + "&Atoken=" + Atoken + "&type=2");
                    $location.path('app/ifra');
                }
            }).error(function () {
                ZENG.msgbox.show("获取数据失败", 5, 1500);
            });
        }
        /* end LMJ*/

    })

    //指令 stringToNumber 字符串转化为数字，进行回显操作
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    return parseInt(value);
                });
            }
        };
    })

    //服务 loadDatePbService 用于每次去加载某一周的排班情况
    .service('loadDatePbService', function ($rootScope, $http, $ionicLoading) {
        //定义数组用于匹配星期相对应的id
        var dataweek = [{
            id: "xs1",
            name: "WEEK.1上午"
        }, {
            id: "xs8",
            name: "WEEK.1中午"
        }, {
            id: "xs15",
            name: "WEEK.1下午"
        }, {
            id: "xs22",
            name: "WEEK.1晚上"
        }, {
            id: "xs2",
            name: "WEEK.2上午"
        }, {
            id: "xs9",
            name: "WEEK.2中午"
        }, {
            id: "xs16",
            name: "WEEK.2下午"
        }, {
            id: "xs23",
            name: "WEEK.2晚上"
        }, {
            id: "xs3",
            name: "WEEK.3上午"
        }, {
            id: "xs10",
            name: "WEEK.3中午"
        }, {
            id: "xs17",
            name: "WEEK.3下午"
        }, {
            id: "xs24",
            name: "WEEK.3晚上"
        }, {
            id: "xs4",
            name: "WEEK.4上午"
        }, {
            id: "xs11",
            name: "WEEK.4中午"
        }, {
            id: "xs18",
            name: "WEEK.4下午"
        }, {
            id: "xs25",
            name: "WEEK.4晚上"
        }, {
            id: "xs5",
            name: "WEEK.5上午"
        }, {
            id: "xs12",
            name: "WEEK.5中午"
        }, {
            id: "xs19",
            name: "WEEK.5下午"
        }, {
            id: "xs26",
            name: "WEEK.5晚上"
        }, {
            id: "xs6",
            name: "WEEK.6上午"
        }, {
            id: "xs13",
            name: "WEEK.6中午"
        }, {
            id: "xs20",
            name: "WEEK.6下午"
        }, {
            id: "xs27",
            name: "WEEK.6晚上"
        }, {
            id: "xs7",
            name: "WEEK.7上午"
        }, {
            id: "xs14",
            name: "WEEK.7中午"
        }, {
            id: "xs21",
            name: "WEEK.7下午"
        }, {
            id: "xs28",
            name: "WEEK.7晚上"
        }]

        //需要的参数 x：工作室id
        this.xsFun = function (x, bt, et) {

            //加载动画
            $ionicLoading.show({
                content: '加载中...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            // console.info("选择的开始时间和结束时间：" + bt + ":" + et);
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
                    // console.info(datas);
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
                        // console.info("需要渲染的时间段：" + pb); //周五下午

                        for (var j = 0; j < dataweek.length; j++) {
                            var s = angular.element(document.getElementById(dataweek[j].id));

                            //匹配的要渲染格子
                            if (pb == dataweek[j].name) {
                                var kyPerson = parseInt(mydate[i].reservationNum);
                                var yjPerson = parseInt(mydate[i].reservationedNum);

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
                                    var pos = reserText.indexOf('(');
                                    var pos2 = reserText.indexOf(')');
                                    reserNum = reserText ? parseInt(reserText.substr(0, pos)) : 0;
                                    reseredNum = reserText ? parseInt(reserText.substr(pos + 1, pos2)) : 0;
                                }

                                if (mydate[i].status == 1) { // 启用
                                    var ky = kyPerson + reserNum;
                                    var yj = yjPerson + reseredNum;
                                    if (s[0].innerHTML.indexOf('停诊') > -1) {
                                        s[0].innerHTML += ky + '(' + yj + ')';
                                        s[0].style.backgroundColor = "red";
                                    } else {
                                        s[0].innerHTML = ky + '(' + yj + ')';
                                    }

                                    //排班满员
                                    if (ky == yj) {
                                        s[0].style.backgroundColor = '#FFC900';
                                    } else if (ky != yj && s[0].innerHTML.indexOf('停诊') == -1) {
                                        s[0].style.backgroundColor = "#19adbf";
                                    }
                                }

                                // console.info("最后字段:" + s[0].innerHTML);
                                break;
                            }
                        }
                    }
                    $rootScope.oneWeekRange = mydate;
                    // console.info("调用服务请求某一周的排班数据");
                    // console.info($rootScope.oneWeekRange);
                    //清空下面的选择项
                    $rootScope.tableChoose = "";
                    //关闭动画
                    $ionicLoading.hide();
                    return;
                } else {
                    // console.info(datas);
                    //关闭动画
                    $ionicLoading.hide();
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                }
            }).error(function (datas) {
                // console.info(datas);
                //关闭动画
                $ionicLoading.hide();
                ZENG.msgbox.show(datas.errorMessage, 5, 1500);
            });
        }
    })

    .controller('dcinforController', function ($scope, $rootScope, $http, $location, $ionicPopup, $timeout, docService,$state) {
        $http({
            method: 'post',
            url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser',
        }).success(function (datas) {
            // console.log(datas);
            $rootScope.dotMess = datas.roots[0];
        }).error(function (datas) {
            ZENG.msgbox.show('获取数据错误！',1,1500);
        })

        //医生信息
        $scope.gotoinfo = function () {
            //进入医生信息录取页面,如果第一次进入获取不到值
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser',
            }).success(function (datas) {
                if (!datas.success) {
                    // console.info(datas);
                } else {
                    console.info(datas);
                    //跳转医生信息录取页面
                    // console.info("获取之前保存的医生信息：");
                    //返回的数据的，会有多条吗？现在只遍历出来第一条数据，进行回显，回显：查看和修改医生信息；
                    // console.info(datas.roots);
                    if (datas.roots.length == 0) {
                        $rootScope.dotMess = {};
                    } else {
                        $rootScope.dotMess = datas.roots[0];
                    }
                    // console.log($rootScope.dotMess);
                    $location.path('/app/dotmess');
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            });
        };

        $scope.gotock = function () {
            $location.path("/app/dotroomloc");
        };

        $scope.gotoadr = function () {
            $location.path("app/manageadr");
        };

        $scope.gotoincome = function () {
            $location.path("app/income");
        };

        $scope.docQRcode = function (docID, studioID) {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/oauthsys/wxoauth/getPersonQrcodeParams?doctorId=' + docID + '&studioId=' + studioID
            }).success(function (data) {
                if (data.success) {
                    $rootScope.studioQRcodeURL = data.url;
                    // console.log($rootScope.studioQRcodeURL);
                    $rootScope.myPopup = $ionicPopup.show({
                        // template: "<div id='qrcode' style='width: 200px; height: 200px; margin: 0 auto;'></div>",
                        template: '<div id="qrcode" style="position: relative;display: table;margin: 0 auto;"><div id="canv" style="background-color: #fff; border-radius: 20px;position: absolute;top: 0;left: 0;bottom: 0;right: 0;box-sizing:border-box;margin: auto;"><img id="img" style="width:90%;border-radius: 20px;margin: auto;position: absolute;top: 0;left: 0;bottom: 0;right: 0;" src=' + $rootScope.avatarurl + ' alt=""></div></div>',
                        title: '（医生）二维码',
                        subTitle: '',
                        scope: $scope,
                        buttons: [{
                            text: '取消',
                        }]
                    });
                    $timeout(function () {
                        $("#qrcode").qrcode({
                            render: "canvas",    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
                            text: $rootScope.studioQRcodeURL,    //扫描二维码后显示的内容,可以直接填一个网址，扫描二维码后自动跳向该链接
                            width: "200",               //二维码的宽度
                            height: "200",              //二维码的高度
                            background: "#ffffff",       //二维码的后景色
                            foreground: "#000000",        //二维码的前景色
                            // src : $rootScope.avatarurl
                        });
                        $('#canv').width($('#qrcode canvas').width() / 3);
                        $('#canv').height($('#qrcode canvas').height() / 3);
                    }, 0);
                }
            }).error(function (data) {
                // console.log(data);
            })
        };

        $scope.qrfd = function (n) {
            var n = $rootScope.dotMess;
            $rootScope.myPopup = $ionicPopup.show({
                template: "<div id='qrcode' style='width: 200px; height: 200px; margin: 0 auto;'></div>",
                // template: "<div id='qrcode' style='width: 200px; height: 200px; margin: 0 auto;'><div id='canv' style='background-color: #fff; border-radius: 20px;position: absolute;top: 0;left: 0;bottom: 0;right: 0;box-sizing:border-box;margin: auto;'><img id='img' style='width:90%;border-radius: 20px;margin: auto;position: absolute;top: 0;left: 0;bottom: 0;right: 0;'' src='http://image.tcmtrust.com/medicalsys/photoPic/2017-03-30/2493001423388' alt=''></div>",
                title: '（医生）二维码',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }]
            });

            $timeout(function () {
                var qrcode = new QRCode('qrcode', {
                    width: 200, //设置宽高
                    height: 200
                });
                qrcode.makeCode("http://localhost/doctors/#/app/docinfo?stid=" + n.id + "&dcid=" + $rootScope.loginUserId);
            }, 0);

        };

        $scope.qrfu = function (n) {
            $rootScope.myPopup = $ionicPopup.show({
                template: "<div id='qrcode' style='width: 200px; height: 200px; margin: 0 auto;'></div>",
                title: '（用户）二维码',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }]
            });

            $timeout(function () {
                var qrcode = new QRCode('qrcode', {
                    width: 200, //设置宽高
                    height: 200
                });
                qrcode.makeCode("http://localhost/user/#/app/docinfo?stid=" + n.id + "&dcid=" + $rootScope.loginUserId);
            }, 0);

        };

        $scope.view = function (n) {
            $scope.showindex = n.$$hashKey;
            // console.log(n);
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/doctorInfo/getDocListByStudioId?studioId=' + n.id,
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                    $scope.doclist = data.roots;
                }
            }).error(function () {
                // console.log("error");
            });
        };
        //修改头像
        $scope.changeavatar = function () {
            // $location.path('app/changeavatar');
            $state.go('app.changeavatar',{'a':1},{reload:true});
        };

        $scope.Reauthorize = function (accountId) {
            location.href = 'http://localhost/medicalsys/paysys/wechat/oauthUser?accountId=' + accountId + '&userType=3';
        }

        $scope.followUp = function () {
            $location.path("/app/followUpNotice");
        }
    })

    .controller('wdlistController', function ($scope, $rootScope, $http, $location) {
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/paysys/applyamount/getApplyOrderAmountList?userAccount=' + $rootScope.aa
        }).success(function (data) {
            if (data.success) {
                // console.log(data);
                $scope.wdlist = data.roots;
            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });

        $scope.wddetail = function (n) {
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/paysys/settleorder/getOrderSettleList?cashId=' + n.id
            }).success(function (data) {
                if (data.success) {
                    // console.log(data);
                    $rootScope.iclist = data.roots;
                    $location.path('app/iclist');
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
            $rootScope.dict = 2;
        }
    })

    //提现
    .controller('withdrawController', function ($scope, $rootScope, $http, $location) {
        // console.log($rootScope.icarr);
        $scope.haveselect = true;
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/paysys/docbankaccount/getDoctorAccountList?userId=' + $rootScope.loginUserId
        }).success(function (data) {
            if (data.success) {
                if (data.total != 0) {
                    for (i = 0; i < data.roots.length; i++) {
                        if (data.roots[i].status == 1) {
                            $scope.selectcard = data.roots[i];
                            $scope.haveselect = true;
                            break;
                        } else {
                            $scope.haveselect = false;
                        }
                    }
                } else {
                    $scope.haveselect = false;
                }
            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });
        $scope.cbcard = function () {
            $location.path('app/choosecard');
        }

        $scope.withdraw = function () {
            var obj = {
                accountId: $scope.selectcard.id
            };
            var paramstr = $.param(obj) + $rootScope.icarr;
            if ($scope.selectcard == undefined || $scope.selectcard == '') {
                ZENG.msgbox.show("请选择银行卡", 1, 1500);
                return;
            }
            if ($rootScope.icarr == '') {
                ZENG.msgbox.show("暂无未提现金额", 1, 1500);
                return;
            } else {
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/paysys/applyamount/saveOrUpdate',
                    data: paramstr,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data.success) {
                        // console.log(data);
                    }
                }).error(function (data) {
                    // console.log(data)
                })
            }
        }
    })

    .controller('cbcController', function ($scope, $rootScope, $http, $ionicPopup, $location) {
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/paysys/docbankaccount/getDoctorAccountList?userId=' + $rootScope.loginUserId
        }).success(function (data) {
            if (data.success) {
                $scope.bankcardlist = data.roots;
            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });
        $scope.gotoaddcard = function () {
            $location.path('app/bankcard');
        }

        $scope.delcard = function (n) {
            window.event ? window.event.cancelBubble = true : e.stopPropagation();
            var b = {
                id: n.id
            };
            $rootScope.myPopup = $ionicPopup.confirm({
                template: "此操作不可恢复，确定？",
                title: '提示！',
                buttons: [{
                    text: '取消',
                }, {
                    text: '确定',
                    type: 'button-balanced',
                    onTap: function (e) {
                        return 1;
                    }
                }]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    $http({
                        method: 'post',
                        data: $.param(b),
                        url: 'http://localhost/medicalsys/paysys/docbankaccount/delDoctorAccount',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).success(function (data) {
                        if (data.success) {
                            // console.log(data);
                            $http({
                                method: 'get',
                                url: 'http://localhost/medicalsys/paysys/docbankaccount/getDoctorAccountList?userId=' + $rootScope.loginUserId
                            }).success(function (data) {
                                if (data.success) {
                                    $scope.bankcardlist = data.roots;
                                } else {
                                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                                }
                            }).error(function (data) {
                                ZENG.msgbox.show(data.errorMessage, 5, 1500);
                            });
                        } else {
                            ZENG.msgbox.show(data.errorMessage, 1, 1500);
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    });
                } else {
                    // console.log("cancel!");
                }
            })
        }

        $scope.selectbc = function (n) {
            $rootScope.selectcard = n;
            $rootScope.haveselect = true;
            obj = {
                status: 1,
                id: n.id,
                userId: $rootScope.loginUserId
            };
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/paysys/docbankaccount/updateAccountStatus',
                data: $.param(obj),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                if (data.success) {
                    // console.log(data);
                    $location.path('app/withdraw');
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
    })

    .controller('acardController', function ($scope, $rootScope, $http, $location) {
        $scope.bank = ["广州银行", "中国银行", "建设银行"];
        $scope.bc = {};
        $scope.addcard = function () {
            if (!$scope.bc.account) {
                ZENG.msgbox.show("请输入银行卡号", 1, 1500);
                return;
            }
            var tmp = true, total = 0;
            for (var i = $scope.bc.account.length; i > 0; i--) {
                var num = $scope.bc.account.substring(i, i - 1);
                if (tmp = !tmp, tmp) num = num * 2;
                var gw = num % 10;
                total += (gw + (num - gw) / 10);
            }
            if (total % 10 != 0) {
                ZENG.msgbox.show("银行卡号不正确", 1, 1500);
                return;
            }
            if (!$scope.bc.bank) {
                ZENG.msgbox.show("请选择银行", 1, 1500);
                return;
            }
            if (!$scope.bc.accounter) {
                ZENG.msgbox.show("请输入您的姓名", 1, 1500);
                return;
            }
            if (!$scope.bc.bankBranch) {
                ZENG.msgbox.show("请输入支行名称", 1, 1500);
                return;
            }
            $scope.bc.doctorId = $rootScope.dcid;
            $scope.bc.userId = $rootScope.loginUserId;
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/paysys/docbankaccount/saveOrUpdate',
                data: $.param($scope.bc),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                if (data.success) {
                    // console.log(data);
                    $location.path('app/choosecard');
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
    })

    //上传头像
    .controller('upavatarController', function ($scope, $rootScope, $http, $location, locals,$stateParams) {
        var a = $stateParams.a;
        if(a){ // a==1 重新加载刷新页面 不然无法上传头像图片
            document.location.reload();
        }
        var h = document.documentElement.clientHeight - 44;
        $("#clipArea").css("height", h);
        var hammer = '';
        var currentIndex = 0;
        var body_width = $('body').width();
        var body_height = $('body').height();
        $("#clipArea").photoClip({
            width: body_width * 0.8125,
            height: body_width * 0.8125,
            file: "#file",
            view: "#hit",
            ok: "#clipBtn",
            loadStart: function () {
                console.log("照片读取中");
            },
            loadComplete: function () {
                console.log("照片读取完成");
            },
            loadError:function (data) {
                console.log(data);
            },
            clipFinish: function (dataURL) {
                $('#hit').attr('src', dataURL);
                $scope.saveImageInfo();
            }
        });
        //图片上传
        $scope.saveImageInfo = function () {
            var lcuserid = locals.get("doclocaluserid");
//  var filename = $('#hit').attr('fileName');
            var img_data = $('#hit').attr('src');
//  render(img_data);
            img_data = img_data.split(',')[1];
            if (!img_data) return;
            img_data = window.atob(img_data);

            var ia = new Uint8Array(img_data.length);
            for (var i = 0; i < img_data.length; i++) {
                ia[i] = img_data.charCodeAt(i);
            }
            ;

            var im = new Blob([ia], {
                type: "image/png"
            });
            var fd = new FormData();
            fd.append('file', im);
            fd.append('userId', lcuserid);
            // console.log(fd);
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/emp/photo/upLoadPhoto',
                data: fd,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity
            }).success(function (data) {
                if (data.success) {
                    // console.log(data);
                    $rootScope.avatarurl = "http://image.tcmtrust.com" + data.data.path;
                    $location.path('app/checklist');
                    ZENG.msgbox.show("修改头像成功", 4, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });

        }
        /*获取文件拓展名*/
        function getFileExt(str) {
            var d = /\.[^\.]+$/.exec(str);
            return d;
        }
        //图片上传结束
        $(function () {
            $('#upload2').on('touchstart', function () {
                //图片上传按钮
                $('#file').click();
            });
        })

        function Close() {
            $('#plan').hide();
        }
        // 渲染 Image 缩放尺寸
        function render(src) {
            var MAX_HEIGHT = 256;  //Image 缩放尺寸
            // 创建一个 Image 对象
            var image = new Image();

            // 绑定 load 事件处理器，加载完成后执行
            image.onload = function () {
                // 获取 canvas DOM 对象
                var canvas = document.getElementById("myCanvas");
                // 如果高度超标
                if (image.height > MAX_HEIGHT) {
                    // 宽度等比例缩放 *=
                    image.width *= MAX_HEIGHT / image.height;
                    image.height = MAX_HEIGHT;
                }
                // 获取 canvas的 2d 环境对象,
                // 可以理解Context是管理员，canvas是房子
                var ctx = canvas.getContext("2d");
                // canvas清屏
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = image.width;        // 重置canvas宽高
                canvas.height = image.height;
                // 将图像绘制到canvas上
                ctx.drawImage(image, 0, 0, image.width, image.height);
                // !!! 注意，image 没有加入到 dom之中

                var dataurl = canvas.toDataURL("image/jpeg");
                var imagedata = encodeURIComponent(dataurl);
                $('#plan').attr('data-src', dataurl);
                $('#plan').show();
            };
            image.src = src;
        };
        $scope.backToCheckList = function () {
            $location.path('/app/checklist');
        }
    })

    //dotRangeController 医生排班
    .controller('dotRangeController', function ($scope, $rootScope, $http, $location, $state, $ionicPopup, $filter, $ionicLoading, loadDatePbService, timezone,numtostr,dateService) {
        //获取本星期的周一
        var now = new Date(dateService.getServerDate());
        $scope.whichday = new Date(dateService.getServerDate()).getDate();
        var nowTime = now.getTime();
        var day = now.getDay();
        var oneDayLong = 24 * 60 * 60 * 1000;
        var MondayTime = nowTime - (day - 1) * oneDayLong;// 不用周一开始，采用当天开始
        var today = new Date(nowTime);

        //设置详情div为隐藏状态
        $scope.mystyle = false;
        $scope.spstyle = false;
        $scope.sxWeek = true;

        $scope.morning = "上午";
        $scope.noon = "中午";
        $scope.afternoon = "下午";
        $scope.evening = "晚上";
        $scope.week1 = '周' + numtostr.fun(day);
        $scope.week2 = '周' + numtostr.fun(((day + 1) > 7 ? (day + 1) - 7 : (day + 1)));
        $scope.week3 = '周' + numtostr.fun(((day + 2) > 7 ? (day + 2) - 7 : (day + 2)));
        $scope.week4 = '周' + numtostr.fun(((day + 3) > 7 ? (day + 3) - 7 : (day + 3)));
        $scope.week5 = '周' + numtostr.fun(((day + 4) > 7 ? (day + 4) - 7 : (day + 4)));
        $scope.week6 = '周' + numtostr.fun(((day + 5) > 7 ? (day + 5) - 7 : (day + 5)));
        $scope.week7 = '周' + numtostr.fun(((day + 6) > 7 ? (day + 6) - 7 : (day + 6)));
        $scope.wek1 = 'WEEK.' + numtostr.fun1(day);
        $scope.wek2 = 'WEEK.' + numtostr.fun1((day + 1) > 7 ? (day + 1) - 7 : (day + 1));
        $scope.wek3 = 'WEEK.' + numtostr.fun1((day + 2) > 7 ? (day + 2) - 7 : (day + 2));
        $scope.wek4 = 'WEEK.' + numtostr.fun1((day + 3) > 7 ? (day + 3) - 7 : (day + 3));
        $scope.wek5 = 'WEEK.' + numtostr.fun1((day + 4) > 7 ? (day + 4) - 7 : (day + 4));
        $scope.wek6 = 'WEEK.' + numtostr.fun1((day + 5) > 7 ? (day + 5) - 7 : (day + 5));
        $scope.wek7 = 'WEEK.' + numtostr.fun1((day + 6) > 7 ? (day + 6) - 7 : (day + 6));

        //这7天的日期对象  日期格式： day1：2016-09-09
        var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0);
        $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
        var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
        var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
        $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
        var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
        $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
        var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
        $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
        var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
        $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
        var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
        $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');

        $scope.sfLoc = false;
        //下拉框选择，详细地址跟踪变化
        $scope.selectChange = function (lc) {
            $scope.sfLoc = true;
            // console.info(lc);
            var dotLocation = $rootScope.dotLocation;
            for (var i = 0; i < dotLocation.length; i++) {
                if (dotLocation[i].id == lc) {
                    $rootScope.locDetail = dotLocation[i].address;
                }
            }
        }

        //上下周操作
        beginWeek = 0;

        //选择上周
        $scope.lastPb = function () {

            //隐藏下面的div
            $scope.mystyle = false;
            $scope.spstyle = false;

            beginWeek--;
            nowWeek = beginWeek * 7;
            changedate = nowTime + nowWeek * oneDayLong;
            $scope.whichday = new Date(changedate).getDate();
            //这7天的日期对象  日期格式： day1：2016-09-09
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0 + nowWeek);
            $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 + nowWeek);
            $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2 + nowWeek);
            $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3 + nowWeek);
            $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4 + nowWeek);
            $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5 + nowWeek);
            $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6 + nowWeek);
            $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');

            //调用服务加载上一周的排班情况  可以传周一的日期

            //通过loadDatePbService服务，按照日期加载“本周”的排班详情
            loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);

        }

        //选择下周
        $scope.nextPb = function () {

            //隐藏下面的div
            $scope.mystyle = false;
            $scope.spstyle = false;

            beginWeek++;
            nowWeek = beginWeek * 7;
            changedate = nowTime + nowWeek * oneDayLong;
            $scope.whichday = new Date(changedate).getDate();

            //这7天的日期对象  日期格式： day1：2016-09-09
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0 + nowWeek);
            $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 + nowWeek);
            $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2 + nowWeek);
            $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3 + nowWeek);
            $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4 + nowWeek);
            $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5 + nowWeek);
            $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6 + nowWeek);
            $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');

            //调用服务加载下一周的排班情况  可以传周一的日期

            //通过loadDatePbService服务，按照日期加载“本周”的排班详情
            loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);
        }

        //变量声明
        $rootScope.xsCRId = ""; // 工作室id，初始化用户判断用户是否选择工作室

        //选择工作室，进行数据加载,加载的数据为这个工作室接下来的7天排班情况
        $scope.CdotRoom = function (x) {
            //var x= y.id;
            //x：工作室id
            $rootScope.xsCRId = x;
            // console.info("选择的工作室ID：" + x);
            $scope.mystyle = false;
            $scope.spstyle = false;
            //使得上下周按钮可见
            $scope.sxWeek = false;
            //选择工作室之后，回到本周的排班情况
            //这7天的日期对象  日期格式： day1：2016-09-09
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0);
            $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
            $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
            $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
            $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
            $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
            $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');

            //选择好工作室，加载对应的预约地址
            drdate = new Date(dateService.getServerDate()).getTime();
            $http({
                method: 'get',
//          url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByStudioId?_dc=' + drdate + '&studioId=' + $rootScope.xsCRId + '&page=1&start=0&limit=999',
                url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByDocId'
            }).success(function (data) {
                if (data) {
                    // console.info("加载的工作室地址");
                    // console.info(data);
                    var dotLocation = [];
                    for (var i = 0; i < data.list.length; i++) {
                        dotLocation.push(data.list[i]);
                    }
                    $rootScope.dotLocation = dotLocation;
                    //上面一层是加载工作的预约地址

                    //通过loadDatePbService服务，按照日期加载“本周”的排班详情
                    loadDatePbService.xsFun(x, $scope.day1, $scope.day7);
                } else {
                    ZENG.msgbox.show("获取数据失败", 1, 1500);
                }
            }).error(function (data) {
                // console.info(data);
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }

        //自动调用  dotSelectList
        $scope.CdotRoom($rootScope.firstPb);
        //修改，最后
        $scope.falXSName = $rootScope.firstPb;

        $scope.reg2 = {};
        $scope.reg = {};

        //点击表格的点击事件响应，有数据进行显示，没有数据进行新增操作
        $scope.dotYY = function (day, week, wek, mynoon, $event) {
            var present = new Date(dateService.getServerDate());
            var endday = day + " " + "23:59:59"
            var clicktime = new Date(endday);
            if (clicktime < present) {
                $($event.target).parent().parent().children().children().css("border", "solid 1px #ae7649");
                $($event.target).css("border", "solid 2px red");
                // console.log("已过时间不能排班");
                $scope.mystyle = false;
                return;
            }
            // console.info("选中的时间点：" + day + "" + week + "" + mynoon);
            $($event.target).parent().parent().children().children().css("border", "solid 1px #ae7649");
            $($event.target).css("border", "solid 2px #33cd5f");

            //判断是否选择了工作室
            if ($rootScope.xsCRId == "") {
                ZENG.msgbox.show("请先选择你的工作室！", 1, 1500);
                return;
            } else {
                //最后选择的日期：2016-08-24，星期，时间点（上下午）
                $scope.dotData = day;
                $scope.dotWeek = week;
                $scope.dotNoon = mynoon;

                if (mynoon == '上午') {
                    timezone.searchtime("MORN_STARTTIME").then(function (result) {
                        $rootScope.showBeginTime = result;
                    })
                    timezone.searchtime("MORN_ENDTIME").then(function (result) {
                        $rootScope.showOverTime = result;
                    })
                    //              $rootScope.showBeginTime = mornBTime;
                    //              $rootScope.showOverTime = mornOTime;
                } else if (mynoon == '中午') {
                    timezone.searchtime("NOON_STARTTIME").then(function (result) {
                        $rootScope.showBeginTime = result;
                    })
                    timezone.searchtime("NOON_ENDTIME").then(function (result) {
                        $rootScope.showOverTime = result;
                    })
                } else if (mynoon == '下午') {
                    timezone.searchtime("PM_STARTTIME").then(function (result) {
                        $rootScope.showBeginTime = result;
                    })
                    timezone.searchtime("PM_ENDTIME").then(function (result) {
                        $rootScope.showOverTime = result;
                    })
                } else if (mynoon == '晚上') {
                    timezone.searchtime("NIGHT_STARTTIME").then(function (result) {
                        $rootScope.showBeginTime = result;
                    })
                    timezone.searchtime("NIGHT_ENDTIME").then(function (result) {
                        $rootScope.showOverTime = result;
                    })
                }

                //判断这个时间段是否有排班
                $scope.sfFind = false;
                $scope.mystyle = false;
                $scope.spstyle = false;
                oneWeek = $rootScope.oneWeekRange;
                var whWeeks = [];
                //test
                timearr = [];
                //
                for (var i = 0; i < oneWeek.length; i++) {
                    //判断吻合的周几和上下午
                    if ((oneWeek[i].weekNum == wek) && (oneWeek[i].timeTypeText == mynoon) && (oneWeek[i].appDateTime == day)) {
                        // console.info(oneWeek[i]);

                        //test
                        var beginstr = oneWeek[i].startTime.split(".")[1];
                        beginstr = parseInt(beginstr);
                        // console.log(beginstr);
                        var endstr = oneWeek[i].endTime.split(".")[1];
                        endstr = parseInt(endstr);
                        // console.log(endstr);
                        for (var j = beginstr; j < endstr; j++) {
                            timearr.push(j);
                        }
                        // console.log(timearr);
                        //
                        $scope.sfFind = true;
                        whWeeks.push(oneWeek[i]);
                    } else {
                        //重置新增的数据项为空
                        $scope.reg.xsBTime = "";
                        $scope.reg.xsOTime = "";
                        $scope.reg.location = "";
                        $scope.reg.xsPerson = "";
                    }
                }

                $rootScope.tableChoose = whWeeks;

                //这个时间段没有排班，新增排班！
                if (!$scope.sfFind) {
                    $scope.mystyle = true;
                    $scope.spstyle = false;
                    $scope.sfLoc = false;
                    $scope.reg.location = $rootScope.dotLocation[0].id;
                }
            }
        }

        $scope.xgLoc = false;
        //显示下面的详细地址
        $scope.showLoc = function () {
            if ($scope.xgLoc) {
                $scope.xgLoc = false;
            } else {
                $scope.xgLoc = true;
            }
        }

        //创建新的地址
        $scope.createLoc = function () {
            $location.path('/app/manageadr');
        }

        $scope.reg2 = {};

        //选择列表，进行数据回显
        $scope.hxPb = function (tc) {

            //console.info(tc);
            //这个时间段有排班
            $scope.mystyle = false;
            $scope.spstyle = true;
            $scope.xgLoc = false;

            //数据回显
            $scope.reg2.xsBTime2 = tc.startTime;
            $scope.reg2.xsOTime2 = tc.endTime;
            $scope.reg2.xsPerson = tc.reservationNum;
            $scope.myxsPerson = tc.reservationedNum;

            $scope.reg2.location2 = tc.appPlace;
            $scope.reg2.name = tc.name;
            $scope.reg2.studioId = tc.studioId;
            $scope.reg2.timeType = tc.timeType;
            $scope.reg2.weekNum = tc.weekNum;
            $rootScope.pbId = tc.id;

            //获取排班明细的id、下拉框的开始时间，结束时间，以及预约人数
            $scope.reg2.scheduleId = tc.studioScheduleId;
            $rootScope.xsStatus = tc.status;
            $rootScope.tzName = tc.appDateTime + " " + tc.startTimeText + "~" + tc.endTimeText;

            //排班地址的详细回显
            $rootScope.locDetail = tc.appPlaceText;

        }

        //有排班的基础上，新增同一个时间段排班
        $scope.reCreate = function () {
            $scope.mystyle = true;
            $scope.spstyle = false;
        }

        //创建排班操作
        $scope.reg = {};
        $scope.x = {};
        $scope.showdis = function () {
            $rootScope.myPopup = $ionicPopup.confirm({
                template: "勾取固定排班选项，你所设置的排班时间段将会应用到每个星期",
                title: '提示',
                buttons: [{
                    text: '确定',
                    type: 'button-positive',
                    onTap: function (e) {

                        return 1;
                    }
                },]
            });
        };


        var tempFun = function () {
            if ($scope.x.xstype == true) {
                $scope.dotRange.status = 1;
                $scope.dotRange.isFix = 1;
                // 判断上下午的value值
                if ($scope.dotNoon == '上午') {
                    $scope.dotRange.timeType = 0;
                    $scope.dotRange.mornStartTime = $scope.reg.xsBTime;
                    $scope.dotRange.mornEndTime = $scope.reg.xsOTime;
                    $scope.dotRange.mornReservationnum = $scope.reg.xsPerson;

                } else if ($scope.dotNoon == '中午') {
                    $scope.dotRange.timeType = 1;
                    $scope.dotRange.noonStartTime = $scope.reg.xsBTime;
                    $scope.dotRange.noonEndTime = $scope.reg.xsOTime;
                    $scope.dotRange.noonReservationnum = $scope.reg.xsPerson;

                } else if ($scope.dotNoon == '下午') {
                    $scope.dotRange.timeType = 2;
                    $scope.dotRange.pmStartTime = $scope.reg.xsBTime;
                    $scope.dotRange.pmEndTime = $scope.reg.xsOTime;
                    $scope.dotRange.pmReservationnum = $scope.reg.xsPerson;

                } else if ($scope.dotNoon == '晚上') {
                    $scope.dotRange.timeType = 3;
                    $scope.dotRange.nightStartTime = $scope.reg.xsBTime;
                    $scope.dotRange.nightEndTime = $scope.reg.xsOTime;
                    $scope.dotRange.nightReservationnum = $scope.reg.xsPerson;
                }

                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/doctors/studioSchedule/saveStudioAndDetail',
                    data: $.param($scope.dotRange),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (datas) {
                    // console.log(datas);
                    if (datas) {
                        // console.info(datas);
                        $scope.dotRange = {};
                        //创建排班完成，隐藏填写的div
                        $scope.mystyle = false;
                        //通过loadDatePbService服务，按照日期加载“本周”的排班详情
                        loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);
                    } else {
                        // console.info(datas);
                        ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                    }
                }).error(function (data) {
                    // console.info(data);
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);

                });
            } else {
                $scope.dotRange.reservationNum = $scope.reg.xsPerson;
                $scope.cpdata = $scope.dotRange;
                $scope.cpdata.appPlace = $scope.reg.location;
                delete $scope.cpdata.weeks;
                $scope.cpdata.appDateTime = $scope.cpdata.reserDate;
                $scope.cpdata.startTime = $scope.reg.xsBTime;
                $scope.cpdata.endTime = $scope.reg.xsOTime;
                delete $scope.cpdata.reserDate;
                $scope.cpdata.status = 1;
                $scope.cpdata.isFix = 0;
                if ($scope.dotNoon == '上午') {
                    $scope.cpdata.timeType = 0;
                } else if ($scope.dotNoon == '中午') {
                    $scope.cpdata.timeType = 1;
                } else if ($scope.dotNoon == '下午') {
                    $scope.cpdata.timeType = 2;
                } else if ($scope.dotNoon == '晚上') {
                    $scope.cpdata.timeType = 3;
                }

                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/saveStudioSchedulesForOnline',
                    data: $.param($scope.cpdata),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data) {
                        $scope.cpdata = {};
                        //创建排班完成，隐藏填写的div
                        $scope.mystyle = false;
                        ZENG.msgbox.show("成功提交", 4, 1500);
                        // console.log(data);
                        loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);
                    } else {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    }
                }).error(function (data) {
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                });
            }
        }

        $scope.dotRangeReg = function () {
            // console.log($scope.x.xstype);
            $scope.dotRange = {}; // 创建排班提交数据组

            //名称：日期+星期+时间点
            $scope.dotRange.name = $scope.dotWeek + "" + $scope.dotNoon;
            $scope.dotRange.weeks = '1';
            $scope.dotRange.studioId = $rootScope.xsCRId;
            $scope.dotRange.appplace = $scope.reg.location;
            $scope.dotRange.reserDate = $scope.dotData;
            //判断是周几的value值
            if ($scope.dotWeek == '周一') {
                $scope.dotRange.weekNum = 'WEEK.1';
            } else if ($scope.dotWeek == '周二') {
                $scope.dotRange.weekNum = 'WEEK.2';
            } else if ($scope.dotWeek == '周三') {
                $scope.dotRange.weekNum = 'WEEK.3';
            } else if ($scope.dotWeek == '周四') {
                $scope.dotRange.weekNum = 'WEEK.4';
            } else if ($scope.dotWeek == '周五') {
                $scope.dotRange.weekNum = 'WEEK.5';
            } else if ($scope.dotWeek == '周六') {
                $scope.dotRange.weekNum = 'WEEK.6';
            } else if ($scope.dotWeek == '周日') {
                $scope.dotRange.weekNum = 'WEEK.7';
            }
            // console.info($.param($scope.dotRange));
            //test
            var beginstra = $scope.reg.xsBTime.split(".")[1];
            beginstra = parseInt(beginstra);
            // console.log(beginstra);
            var endstra = $scope.reg.xsOTime.split(".")[1];
            endstra = parseInt(endstra);
            // console.log(endstra);
            if ((endstra - beginstra) <= 0) {
                ZENG.msgbox.show("请选择正确的时间段", 1, 1500);
                return;
            }
            for (var j = beginstra; j < endstra; j++) {
                for (var k = 0; k < timearr.length; k++) {
                    if (timearr[k] == j) {
                        ZENG.msgbox.show("选择时间段已重复", 1, 1500);
                        return;
                    }
                }
            }
            var ts = Date.parse(new Date($scope.dotRange.reserDate));
            // console.log(ts);
            var tn = new Date(dateService.getServerDate());
            if (ts - tn <= 24 * 60 * 60 * 1000) {
                ZENG.msgbox.show("请跟客服确认", 1, 1500);
                setTimeout(function () {
                    tempFun();
                }, 500);
            } else {
                tempFun();
            }

        }

        $scope.reg3 = {}; // 修改的提交数据组
        $scope.reg2 = {};

        //修改操作
        $scope.rgModify = function () {

            // console.info($scope.reg2);
            $scope.reg3.name = $scope.reg2.name; //

            //      $scope.reg3.studioId = $scope.reg2.studioId; //
            $scope.reg3.appPlace = $scope.reg2.location2; //
            //      $scope.reg3.weekNum = $scope.reg2.weekNum; //

            //      $scope.reg3.scheduleId = $scope.reg2.scheduleId; //
            //      $scope.reg3.id = $rootScope.pbId; //
            $scope.reg3.id = $rootScope.pbId; //
            //      $scope.reg3.weeks = 1; //

            // console.info("排班的id：" + $scope.reg3.id);
            // console.info("排班明细的id：" + $scope.reg3.scheduleId);

            mytimeType = $scope.reg2.timeType;

            // console.info(mytimeType);

            $scope.reg3.startTime = $scope.reg2.xsBTime2;
            $scope.reg3.endTime = $scope.reg2.xsOTime2;
            $scope.reg3.reservationNum = $scope.reg2.xsPerson;

            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/saveOrUpdate',
                data: $.param($scope.reg3),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (datas.success) {
                    // console.info(datas);
                    ZENG.msgbox.show('修改成功', 4, 1500);
                    $scope.spstyle = false;

                    //通过loadDatePbService服务，按照日期加载“本周”的排班详情
                    loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);

                } else {
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });

        }

        //停诊操作
        $scope.rgStop = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/stopStudioSchedule?id=' + $rootScope.pbId + '&mxName=' + $rootScope.tzName,
            }).success(function (datas) {
                if (datas.success) {
                    // console.info(datas);
                    ZENG.msgbox.show('停诊成功', 4, 1500);
                    $scope.spstyle = false;

                    //通过loadDatePbService服务，按照日期加载“本周”的排班详情
                    loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);
                } else {
                    // console.info(datas);
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }

        //出诊操作
        $scope.rgStart = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/startStudioSchedule?id=' + $rootScope.pbId,
            }).success(function (datas) {
                if (datas.success) {
                    ZENG.msgbox.show('出诊成功！', 4, 1500);
                    $scope.spstyle = false;

                    //通过loadDatePbService服务，按照日期加载“本周”的排班详情
                    loadDatePbService.xsFun($rootScope.xsCRId, $scope.day1, $scope.day7);
                } else {
                    // console.info(datas);
                    ZENG.msgbox.show(datas.errorMessage, 4, 1500);
                }
            }).error(function (datas) {
                ZENG.msgbox.show(datas.errorMessage, 5, 1500);
            });
        }
    })

    //moController 工作室聊天列表详情
    .controller('moController', function ($scope, $timeout, $http, $rootScope, $location) {
        var tempStudioID = $location.search().studioId;
        $scope.isShowList = true;
        $rootScope.unread = 0;
        $scope.getNotReadMessList = function () {
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/webchat/chatmsg/getDoctorStudioNoReadMessageList'
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                    delete data.success;
                    $rootScope.meslist = data.roots;
                    for (var a in data.roots) {
                        if ((data.roots)[a].msgCount != 0) {
                            $rootScope.unread = 1;
                        }
                    }
                }
            }).error(function () {
                // console.log('error');
            });
        }
        $scope.getDotStuMessList = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studio/getDoctorStudioMessageList?id=' + $rootScope.loginUserId
            }).success(function (datas) {
                if (datas.success) {
                    $rootScope.drlists = datas.roots;
                    // 获取聊天列表
                    var indexm;
                    if (tempStudioID != '' && tempStudioID != undefined) {
                        indexm = tempStudioID;
                    } else {
                        indexm = $rootScope.drlists[0].id;
                    }
                    $http({
                        method: 'get',
                        // url: 'http://localhost/medicalsys/webchat/chatmsg/getUserChatMsgByStudio?recvid=' + $rootScope.drlists[0].id
                        url: 'http://localhost/medicalsys/webchat/chatmsg/getUserChatMsgByStudio?recvid=' + indexm
                    }).success(function (data) {
                        ($scope.ulist)[indexm] = data.roots;
                        $scope.AllChatList = data.roots;//
                        $scope.showChatList = ($scope.ulist)[indexm];
                        $scope.chatNotRecall();
                    }).error(function () {
                        // console.log("系统错误");
                    });
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
        $scope.getNotReadMessList();
        $scope.getDotStuMessList();
        $scope.hashkey = {};
        $scope.ulist = {};
        $scope.seelist = function (n) {
            $scope.isShowList = !$scope.isShowList;
        };
        $scope.dochat = function (item, itemb) { // item 医生  itemb 用户
            // console.log(item);
            // console.log(itemb);
            $rootScope.xsHisMsg = [];
            $rootScope.toChatName = itemb.nickname;
            $rootScope.unread = 0;
            $rootScope.a = {};
            $rootScope.a.userid = item.id;
            $rootScope.a.userName = item.dname;
            $rootScope.a.fromStudioName = item.name;
            $rootScope.a.fromStudioId = item.id;
            $rootScope.a.toUserId = itemb.id;
            $rootScope.a.toUserName = itemb.sender;
            $rootScope.chatUserHeaderUrl = itemb.headerUrl;
            var url = 'http://localhost/medicalsys/webscoket/chat/LoginSocket?userId=' + $rootScope.a.userid + '&username=' + $rootScope.a.userName + "&fromType=1&studioId=" + $rootScope.a.toUserId + "&studioName=" + $rootScope.a.toUserName
            $http({
                method: 'get',
                url: url
            }).success(function (data) {
                if (data) {
                    $location.path('/app/mymsgde');
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (datas) {
                ZENG.msgbox.show('webSocket连接错误！', 5, 1500);
            });
        };

        $scope.drmore = function (drlist) {
            //判断选择的工作室列表，然后让下面的div对应的显示出来
            // console.info("消息条数：" + drlist.msgCount);

            if (drlist.msgCount > 0) {
                $scope.mystyle = drlist.$$hashKey;
            } else {
                $scope.mystyle = "xsxs";
            }

            $rootScope.userList = {};
            // console.info(drlist.id);

            //$http.post('http://localhost/medicalsys/doctors/studio/getUserChatMessageList')
            $http({
                method: 'GET',
                url: 'http://localhost/medicalsys/doctors/studio/getUserChatMessageList?id=' + drlist.id

            }).success(function (data) {
                // console.info("获取列表的信息：")
                // console.info(data);
                $rootScope.userList = data.roots;

            }).error(function (datas) {
                ZENG.msgbox.show(datas.errorMessage, 5, 1500);
                // console.info(datas);
            });
        }
        $scope.reSend = function (uMsg, drlist)  {// 回复按钮响应
            $rootScope.a = {};
            $rootScope.delnum = uMsg.msgCount;
            //进入工作室，获取医生的姓名
            $rootScope.a.userName = drlist.docName;
            $rootScope.a.name = drlist.name;
            $rootScope.studiopid = drlist.pid;
            $rootScope.toChatName = uMsg.name;
            $rootScope.a.userid = drlist.id;
            $rootScope.a.fromStudioId = uMsg.id;
            $rootScope.a.tname = uMsg.name;

            $http({
                method: 'get',
                // url: 'http://localhost/medicalsys/webscoket/chat/LoginSocket?username=' + $rootScope.xsMyDotName + '&userId=' + $rootScope.loginUserId + '&studioName=' + $rootScope.studioname + '&studioId=' + $rootScope.aa
                url: 'http://localhost/medicalsys/webscoket/chat/LoginSocket?username=' + $rootScope.xsMyDotName + '&userId=' + $rootScope.loginUserId + '&studioName=' + $rootScope.a.tname + '&studioId=' + $rootScope.a.userid

            }).success(function (data) {
                if (data.success) {

                    $http({
                        method: 'post',
                        url: "http://localhost/medicalsys/webchat/chatmsg/getChatMsgList?page=1&start=0&limit=" + 20 + "&sendId=" + $rootScope.a.userid + "&recvId=" + $rootScope.a.userid + "&reads=" + "1"

                    }).success(function (data) {
                        if (data) {
                            if (data.tatal == data.roots.length) {
                                $scope.isnullmsg = true;
                            }
                            $rootScope.xsHisMsg = data.roots;
                            // console.log($rootScope.xsHisMsg);
                        } else {
                            ZENG.msgbox.show("获取数据失败", 1, 1500);
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    }).finally(function () {
                        $scope.$broadcast('scroll.refreshComplete');
                    });

                    $location.path('/app/mymsgde');
                } else {
                    ZENG.msgbox.show(data.return_msg, 1, 1500);
                }

            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            })
        }
        $scope.markArr = [1,0,0];
        $scope.chatAll = function () {
            $scope.markArr = [1,0,0];
            var indexm;
            if (tempStudioID != '' && tempStudioID != undefined) {
                indexm = tempStudioID;
            } else {
                indexm = $rootScope.drlists[0].id;
            }
            $http({
                method: 'get',
                // url: 'http://localhost/medicalsys/webchat/chatmsg/getUserChatMsgByStudio?recvid=' + $rootScope.drlists[0].id
                url: 'http://localhost/medicalsys/webchat/chatmsg/getUserChatMsgByStudio?recvid=' + indexm
            }).success(function (data) {
                ($scope.ulist)[indexm] = data.roots;
                $scope.AllChatList = data.roots;
                $scope.showChatList = ($scope.ulist)[indexm];
            }).error(function (data) {
                ZENG.msgbox.show(errorMessage,1,1500);
            })
            // $scope.showChatList = $scope.AllChatList;
        }
        $scope.chatOnline = function () {
            var studioId;
            if (tempStudioID != '' && tempStudioID != undefined) {
                studioId = tempStudioID;
            } else {
                studioId = $rootScope.drlists[0].id;
            }
            $scope.markArr = [0,1,0];
            $http({
                method:'post',
                url:'http://localhost/medicalsys/sys/user/getWxUserInfoOnline?studioId='+studioId
            }).success(function (data) {
                $scope.showChatList = [];
                if (data==''){
                    return;
                }
                $scope.showChatList.push(data);
            }).error(function (data) {
                ZENG.msgbox.show(errorMessage,1,1500);
            })
            $scope.showChatList = [];
        }
        $scope.chatNotRecall = function () {
            $scope.markArr = [0,0,1];
            $scope.showChatList = []; // 清空显示列表
            for(var i=0;i<$scope.AllChatList.length;i++){
                if($scope.AllChatList[i].nums != 0){
                    $scope.showChatList.push($scope.AllChatList[i]);
                }else{
                    continue;
                }
            }
        }

        $scope.backToChatList = function () {
            $location.path('/app/drlist');
        }
    })

    .filter("cut", function () {
        return function (input) {
            if (input != undefined) {
                return input.replace("[", "").replace("]", "");
            }
        }
    })

    // 医生聊天控制器
    .controller('skController', function ($scope, $rootScope, $http, $location, $compile, $ionicScrollDelegate, $ionicPopup, $ionicModal, FileUploader, locals, $filter, timezone,dateService) {
        $scope.showRead = false;
        mylimit = 0;
        $.ajax({
                method: 'post',
                async:false,
                url: "http://localhost/medicalsys/webchat/chatmsg/getChatMsgList?page=1&start=0&limit=5&sendId=" + 
                $rootScope.a.userid + "&recvId=" + $rootScope.a.toUserId + "&reads=" + "0,1",
                success:function (data) {
                if (data) {
                    if (data.tatal == data.roots.length) {
                        $scope.isnullmsg = true;
                    } else {
                        $scope.isnullmsg = false;
                    }
                    $rootScope.xsHisMsg = data.roots;
                    $scope.lastsay=data.roots[0]||0;
                    $scope.showRead = true;
                    mylimit += 5;
                    $("#content").empty();
                } else {
                    ZENG.msgbox.show("获取数据失败", 1, 1500);
                }
            },
            error:function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            }
        });
        $scope.initMessageList = function () {  // 默认加载最新5条记录
            mylimit += 5;
            $http({
                method: 'post',
                url: "http://localhost/medicalsys/webchat/chatmsg/getChatMsgList?page=1&start=0&limit=" + mylimit + "&sendId=" + $rootScope.a.userid + "&recvId=" + $rootScope.a.toUserId + "&reads=" + "0,1"
            }).success(function (data) {
                if (data) {
                    if (data.tatal == data.roots.length) {
                        $scope.isnullmsg = true;
                    } else {
                        $scope.isnullmsg = false;
                    }
                    $rootScope.xsHisMsg = data.roots;
                    $scope.showRead = true;
                    $("#content").empty();
                } else {
                    ZENG.msgbox.show("获取数据失败", 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            }).finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        var bfscrolltop = document.body.scrollTop;//获取软键盘唤起前浏览器滚动部分的高度
        $("#msg").focus(function(){//在这里‘input.inputframe’是我的底部输入栏的输入框，当它获取焦点时触发事件
            interval = setInterval(function(){//设置一个计时器，时间设置与软键盘弹出所需时间相近
            document.body.scrollTop = document.body.scrollHeight;//获取焦点后将浏览器内所有内容高度赋给浏览器滚动部分高度
            },100);
            //alert(document.body.scrollHeight);
        }).blur(function(){//设定输入框失去焦点时的事件
            clearInterval(interval);//清除计时器
            document.body.scrollTop = bfscrolltop;//将软键盘唤起前的浏览器滚动部分高度重新赋给改变后的高度
            //alert(bfscrolltop);
        });




        
        //$scope.initMessageList();
        var lockReconnect = false;//避免重复连接
        var ws_addr,isforceOut = !1,tick_heartpac = null,tick_titletips = null,isFocus = !0,
            ws_addr = "ws://localhost/ws2/medicalsys/chatSocket?userId=" + $rootScope.a.userid + "&userName=" + $rootScope.a.userName + "&fromType=1&toId=" + $rootScope.a.toUserId + "&fromStudioName=" + $rootScope.a.fromStudioName;
        function fun_initWebSocket() {
            ZENG.msgbox.show('正在连接,请稍后...', 1, 2000)
            try {
                $rootScope.myWs = new WebSocket(ws_addr);
                // initEventHandle();
            } catch (e) {
                //$scope.again();
            }
        }
        fun_initWebSocket();
        // function initEventHandle() {
        $rootScope.myWs.onopen = function () {
            ZENG.msgbox.show('欢迎进入聊天室~', 1, 1500);
            // $rootScope.myWs=ws;
        };
        $rootScope.myWs.onmessage = function (a) {
            var result = $.parseJSON(a.data);
            clearInterval(tick_heartpac);
            onJsonMessage(result);
        };
        $rootScope.myWs.onclose = function () {
            isforceOut || ZENG.msgbox.show('离开聊天室', 1, 1500),
                clearInterval(tick_heartpac);
            // console.log('退出聊天');
            // if ($rootScope.myWs) {
            //     $scope.again();
            // }
        };
        $rootScope.myWs.onerror = function () {
                ZENG.msgbox.show('您已经离线，请返回重新连接~', 1, 3000);
            };
        // }

        $scope.again = function () {
            ZENG.msgbox.show('重新连接中...', 1, 1500);
            if (lockReconnect) return;
            lockReconnect = true;
            //没连接上会一直重连，设置延迟避免请求过多
            setTimeout(function () {
                fun_initWebSocket();
                lockReconnect = false;
            }, 2000);
        }
        function onJsonMessage(result) {
            if($scope.lastsay.sendTime==result.date&&$scope.lastsay.content==result.sendMsg)return;
            //文字发送
            if (result.from != undefined && result.sendType == 1) {
                //判断发送者是不是当前聊天对象                if(result.fromStudioName == result.from) {
                if (result.from == $rootScope.a.toUserId) {
                    //接收方
                    $("#content").append($compile("<div style='width:100%;margin-left:8px;padding:0 5px;'>" +
                        "<div style='font-size:14px;float:left;'>" + result.date + "&nbsp" + result.fromName + "</div>" +
                        "<div style='clear:both'>" + "</div>" + "</div>" + "<div class='rj-message-wrap' ng-click='seepba($event)'>" +
                        // "<img src='images/me.png' class='rj-head-pic'>" + "<span class='rj-triangle-left'>" + "</span>" +
                        "<img src='" + $rootScope.chatUserHeaderUrl + "' class='rj-head-pic'>" + "<span class='rj-triangle-left'>" + "</span>" +
                        "<p class='rj-message'>" + result.sendMsg + "</p>")($scope));
                    $ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
                } else {
                    //发送方
                    if (result.titleId != undefined && result.titleId != '') { // titleId不为空 发送的是排班信息
                        $("#content").append($compile("<div style='width:100%;margin-right:8px;padding:0 5px;'>" +
                            "<div style='font-size:14px;float:right;'>" + result.date + "&nbsp" + result.fromName + "</div>" +
                            "<div style='clear:both'>" + "</div>" + "</div>" + "<div class='rj-message-wrap' ng-click='seepba($event)'>" +
                            // "<img src='images/black.png' class='rj-head-pic-right'>" + "<span class='rj-triangle-right'>" + "</span>" +
                            "<img ng-src='{{avatarurl}}' class='rj-head-pic-right'>" + "<span class='rj-triangle-right'>" + "</span>" +
                            // temp + result.titleId + "'" + ">" + result.sendMsg + "</p>")($scope));
                            "<p class='rj-message-right isred' title='" + result.titleId + "'" + ">" + result.sendMsg + "</p>")($scope));
                        $ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
                    } else {
                        $("#content").append($compile("<div style='width:100%;margin-right:8px;padding:0 5px;'>" +
                            "<div style='font-size:14px;float:right;'>" + result.date + "&nbsp" + result.fromName + "</div>" +
                            "<div style='clear:both'>" + "</div>" + "</div>" + "<div class='rj-message-wrap' ng-click='seepba($event)'>" +
                            // "<img src='images/black.png' class='rj-head-pic-right'>" + "<span class='rj-triangle-right'>" + "</span>" +
                            "<img ng-src='{{avatarurl}}' class='rj-head-pic-right'>" + "<span class='rj-triangle-right'>" + "</span>" +
                            // temp + result.titleId + "'" + ">" + result.sendMsg + "</p>")($scope));
                            "<p class='rj-message-right' title='" + result.titleId + "'" + ">" + result.sendMsg + "</p>")($scope));
                        $ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
                    }
                }
            }

            //图片发送
            else if (result.from != undefined && result.sendType == 2) {
                result.sendMsg = result.sendMsg.replace("[", "").replace("]", "");
                if (result.from == $rootScope.a.toUserId) {
                    //接收方
                    $("#content").append($compile("<div style='width:100%;margin-left:8px;padding:0 5px;'>" +
                        "<div style='font-size:14px;float:left;'>" + result.date + "&nbsp" + result.fromName + "</div>" +
                        "<div style='clear:both'>" + "</div>" + "</div>" + "<div class='rj-message-wrap'>" +
                        "<img ng-src='{{chatUserHeaderUrl}}' class='rj-head-pic'>" + "<span class='rj-triangle-left'></span>" +
                        "<p class='rj-message'>" + "<img style='float:left; width:200px; height:200px;padding-left:4px;' src=" + "http://image.tcmtrust.com/" + result.sendMsg + " ng-click='picshowa($event)'" + ">" + "</p></div>")($scope));
                    $ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();

                } else {
                    //发送方,样式调好
                    $("#content").append($compile("<div style='width:100%;margin-right:8px;padding:0 5px;'>" +
                        "<div style='font-size:14px;float:right;'>" + result.date + "&nbsp" + result.fromName + "</div>" +
                        "<div style='clear:both'>" + "</div>" + "</div>" + "<div class='rj-message-wrap'>" +
                        "<img ng-src='{{avatarurl}}' class='rj-head-pic-right'>" + "<span class='rj-triangle-right'></span>" +
                        "<p class='rj-message-right'>" + "<img style='float:right; width:200px; height:200px;' src=" + "http://image.tcmtrust.com/" + result.sendMsg + " ng-click='picshowa($event)'" + ">" + "</p></div>")($scope));
                    $ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
                }
            }

            //客服内容
            if (result.from != undefined && result.sendType == 3) {
                var rg = /\[\\(?=([^\[]*\.[a-zA-Z]{2,3}\]))/g;
                var rgm = /\]/g;
                htmladd = result.sendMsg.replace(rg, "<img style='float:left; width:200px; height:200px;' src='http://image.tcmtrust.com/\\").replace(rgm, "'>");
                //接收方
                $("#content").append("<div style='width:100%;margin-right:8px;padding:0 5px;'>" +
                    "<div style='font-size:14px;float:right;'>" + result.date + "&nbsp" + "医生小助手" + "</div>" +
                    "<div style='clear:both'>" + "</div>" + "</div>" + "<div class='rj-message-wrap'>" +
                    "<img src='images/me.png' class='rj-head-pic-right'>" + "<span class='rj-triangle-right'>" + "</span>" +
                    "<p class='rj-message-right'>" + htmladd + "</p></div>");
                $ionicScrollDelegate.$getByHandle('messageDetailsScroll').scrollBottom();
            }
        }
// ws发送信息到服务端
//imgtype是图片时  msg当作图片路径参数
        function sendJson(userType, imgtype, msg) {
            $rootScope.myWs && 1 == $rootScope.myWs.readyState && (msg && (clearInterval(tick_heartpac), tick_heartpac = setInterval(function () {
                    sendJson("heart", "")
                },
                12e4)), $rootScope.myWs.send(JSON.stringify({
                to: $rootScope.a.id,
                toUserId: $rootScope.a.id,
                toUserName: $rootScope.a.name,
                fromType: 0,
                msg: msg,
                imgtype: imgtype, //发送的是文字 1是文字 2是图片
                type: 2, // 单聊
                titleId: "",
                userType: userType
            })))
        }
        //点击发送文本内容
        // $scope.send = function () {
        //     tempVar = 1;
        //     var text = $("#msg").val();
        //     if (ws && 1 == ws.readyState) {
        //         if (!text) return ZENG.msgbox.show('不能输入空字符~', 1, 1500);
        //         void 0;
        //         text ? sendJson(0, 1, text) : sendJson(0, 1, '');
        //         $("#msg").val("");//清空文本框
        //     } else {
        //         ZENG.msgbox.show('你已经离线，请先连接~', 1, 1500);
        //     }
        // };
        // $scope.sendimg = function (imgpath) {
        //     if ($rootScope.myWs && 1 == $rootScope.myWs.readyState) {
        //         if (!imgpath) return ZENG.msgbox.show('图片路径不能为空~', 1, 1500);
        //         void 0;
        //         imgpath ? sendJson(0, 2, imgpath) : sendJson(0, 2, '');
        //     } else {
        //         ZENG.msgbox.show('你已经离线，请先连接~', 1, 1500);
        //     }
        // };
        //图片放大缩小
        $ionicModal.fromTemplateUrl('mypic-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });
        $scope.picshow = function (item) {
            // console.log(item);
            $scope.modal.show();
            $scope.item = item;
        };
        $scope.picshowa = function ($event) {
            // console.log("why");
            // console.log($event.target);
            var hrefstr = $($event.target).attr("src");
            hrefstr = hrefstr.replace("http://image.tcmtrust.com/", "[");
            $scope.item = {};
            $scope.item.content = hrefstr;
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });
        $scope.resize = function (item) {
            var img = new Image();
            img.src = "http://image.tcmtrust.com" + item;
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
        //上传文件
        //1.上传的路径和要传送的额外数据
        var uploader = $scope.uploaderA = new FileUploader({
            url: 'http://localhost/medicalsys/empPatient/attchements/upLoadImageIO',
            formData: [{
                userId: $rootScope.aa
            }],
        });
        //添加文件到上传队列之后
        uploader.onAfterAddingFile = function (fileItem) {
            // console.log(fileItem);
            uploader.uploadAll();
        };
        //文件上传完成之后
        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            // console.info(response);
            if (response.success == true) {
                $scope.sendimg(response.data.path);
            }
            ;
        };
        $scope.myUMsg = false; //常用语显示控制
        $scope.myFun = false; //功能列表的显示控制
        //显示功能列表
        $scope.showFun = function () {
            //console.info("显示功能列表");
            if ($scope.myFun) {
                $scope.myFun = false;
                $scope.myUMsg = false;
                $scope.openol = false;
            } else {
                $scope.myFun = true;
            }
        }
        // 点击页面空白出将功能列表隐藏
        $scope.closeFun = function () {
            if ($scope.myUMsg || $scope.openol) {
                $scope.myUMsg = false;
                $scope.openol = false;
            } else {
                $scope.myFun = false;
            }
            // $scope.myFun = false;
        }
        //加载常用语
        $scope.ulMsg = function () {
            //console.info("加载常用语！");
            var uMsg = [{
                text: "您好！"
            }, {
                text: "您好，请问您身体哪里不舒服？"
            }, {
                text: "您好，请告诉我您的性别、年龄、身高及体重。"
            }, {
                text: "您平日胃口怎么样？有偏重哪个口味的食物吗？"
            }, {
                text: "您有喝酒、抽烟吗？"
            }, {
                text: "会经常感觉口渴吗？您的饮水情况怎么样？"
            }, {
                text: "您几天一次大便或一天几次大便？"
            }, {
                text: "您睡眠情况怎么样？（半夜醒来？很难入睡？)"
            }, {
                text: "早上睡醒后精神怎么样？"
            }, {
                text: "您经常感觉怕风怕冷吗？"
            }, {
                text: "您容易出汗吗？"
            }, {
                text: "您这种情况持续多久了？"
            }, {
                text: "您以前有得过什么病吗？"
            }, {
                text: "您这次生病前有吃过什么药吗？"
            }, {
                text: "您有对什么药物或食物过敏吗？"
            }];
            $rootScope.UlMsg = uMsg;

            if ($scope.myUMsg) {
                $scope.myUMsg = false;
            } else {
                $scope.myUMsg = true;
                $scope.openol = false;
            }
        }
        $scope.myXsUMsg = "";
        //选择的常用语
        $scope.uMsgc = function (umVal) {
            // console.info(umVal);
            $scope.myXsUMsg = umVal;
            //关闭常用语
            $scope.myUMsg = false;
        }
        $scope.ol = {};
        $scope.oldata = {};
        $scope.onlineod = function () {
            $scope.openol = !$scope.openol;
            $scope.myUMsg = false;
            xtime = new Date(dateService.getServerDate());
            $scope.ol.date = $filter('date')(xtime, 'yyyy-MM-dd');
            // console.log($scope.ol.date);
            var hournum = new Date(dateService.getServerDate()).getHours();
            if (0 <= hournum && hournum < 12) {
                $scope.ol.timetype = "0";
                $scope.timeTypetext = "早上";
                $scope.oldata.startTime = 'MORN_STARTTIME.1';
                $scope.oldata.endTime = 'MORN_ENDTIME.13';
            }
            if (12 <= hournum && hournum < 13) {
                $scope.ol.timetype = "1";
                $scope.timeTypetext = "中午";
                $scope.oldata.startTime = 'NOON_STARTTIME.1';
                $scope.oldata.endTime = 'NOON_ENDTIME.2';
            }
            if (13 <= hournum && hournum < 18) {
                $scope.ol.timetype = "2";
                $scope.timeTypetext = "下午";
                $scope.oldata.startTime = 'PM_STARTTIME.1';
                $scope.oldata.endTime = 'PM_ENDTIME.12';
            }
            if (18 <= hournum && hournum < 24) {
                $scope.ol.timetype = "3";
                $scope.timeTypetext = "晚上";
                $scope.oldata.startTime = 'NIGHT_ENDTIME.1';
                $scope.oldata.endTime = 'NIGHT_ENDTIME.8';
            }
        }
        $scope.comfirmol = function () {
            $scope.myFun = false;
            var weekday = new Date(dateService.getServerDate()).getDay();
            // console.log(weekday);
            $scope.sd = "晚上";
            switch (weekday) {
                case 0:
                    $scope.oldata.weekNum = "WEEK.0";
                    $scope.oldata.name = "周日" + $scope.sd;
                    break;
                case 1:
                    $scope.oldata.weekNum = "WEEK.1";
                    $scope.oldata.name = "周一" + $scope.sd;
                    break;
                case 2:
                    $scope.oldata.weekNum = "WEEK.2";
                    $scope.oldata.name = "周二" + $scope.sd;
                    break;
                case 3:
                    $scope.oldata.weekNum = "WEEK.3";
                    $scope.oldata.name = "周三" + $scope.sd;
                    break;
                case 4:
                    $scope.oldata.weekNum = "WEEK.4";
                    $scope.oldata.name = "周四" + $scope.sd;
                    break;
                case 5:
                    $scope.oldata.weekNum = "WEEK.5";
                    $scope.oldata.name = "周五" + $scope.sd;
                    break;
                case 6:
                    $scope.oldata.weekNum = "WEEK.6";
                    $scope.oldata.name = "周六" + $scope.sd;
                    break;
            }
            $scope.oldata.studioId = $rootScope.a.userid;
            $scope.oldata.appplace = "";
            $scope.oldata.appDateTime = $filter('date')($scope.ol.date, 'yyyy-MM-dd');
            $scope.oldata.timeType = $scope.ol.timetype;
            $scope.oldata.status = 5;
            $scope.oldata.reservationNum = 1;
            $scope.oldata.isFix = 0;
            $scope.oldata.orgId='4028c0835db07eca015db08d5a35006c';
            // console.log($scope.oldata);
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/saveStudioSchedulesForOnline',
                data: $.param($scope.oldata),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                    $scope.paibanid = data.data.id;
                    // console.log("生成在线排班成功");
                    val = "在线排班" + data.data.name;
                    obj = {
                        to: $rootScope.a.toUserId,
                        toUserId: $rootScope.a.toUserId,
                        toUserName: $rootScope.a.toUserName,
                        fromType: 0,
                        msg: val,
                        imgtype: 1,
                        type: 2,
                        titleId: $scope.paibanid,
                        userType: 1
                    };
                    // console.log(obj);
                    var str = JSON.stringify(obj);
                    $rootScope.myWs.send(str);
                    $scope.openol = false;
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        };
        $scope.cancelol = function () {

            $scope.openol = false;
        };
        $scope.seepb = function (n) {
            // console.log(n);
            if (n.titleId == undefined) {
                // console.log("no describe");
            } else {
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/getScheduleDetailsList?id=' + n.titleId,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data) {
                        // console.log(data);
                        $rootScope.b = (data.roots)[0];
                        $scope.oppb($rootScope.b);
                    }
                }).error(function () {
                    // console.log("error");
                });
            }
        };
        $scope.seepba = function ($event) {
            var stre = $($event.target).attr("title");
            // console.log(stre);
            if (stre == undefined || stre == '') {
                // console.log("no describe");
            } else {
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/doctors/studioScheduleDetail/getScheduleDetailsList?id=' + stre,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data) {
                        // console.log(data);
                        $rootScope.b = (data.roots)[0];
                        $scope.oppb($rootScope.b);
                    }
                }).error(function () {
                    // console.log("error");
                });
            }
        }
        $scope.oppb = function (o) {
            // console.log(o);
            $rootScope.lspb = o;
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/onlinebox.html",
                title: '临时排班',
                buttons: [{
                    text: '取消'

                },]
            })

        };
        //发送消息往后台传送文字消息
        $scope.send = function () {
            $scope.myFun = false;
            var val = $("#msg").val();
            if (val == '') {
                ZENG.msgbox.show("发送消息不能为空", 1, 1500);
            } //消息内容
            else {
                var obj = null;
                obj = {
                    to: $rootScope.a.toUserId,
                    toUserId: $rootScope.a.toUserId,
                    toUserName: $rootScope.a.toUserName,
                    fromStudioName: $rootScope.a.fromStudioName,
                    userId: $rootScope.a.userid,
                    fromType: 0,
                    msg: val,
                    imgtype: 1, //发送的是文字
                    type: 2, // 单聊
                    titleId: "",
                    userType: 1
                };
                var str = JSON.stringify(obj); //js将对象转为json
                // console.log(str);
                $rootScope.myWs.send(str); //发送消息
                $("#msg").val(""); //清空文本框
            }
        }
        //发送图片往后台传送图片消息
        $scope.sendimg = function (imgpath) {
            var val = imgpath; //图片路径
            var obj = null;
            obj = {
                to: $rootScope.a.toUserId,
                toUserId: $rootScope.a.toUserId,
                toUserName: $rootScope.a.toUserName,
                fromStudioName: $rootScope.a.fromStudioName,
                userId: $rootScope.a.userid,
                fromType: 0,
                msg: val,
                imgtype: 2, //发送的是图片
                type: 2, // 单聊
                titleId: "",
                userType: 1
            };
            var str = JSON.stringify(obj); //js将对象转为json
            $rootScope.myWs.send(str); //发送消息
            $("#msg").val(""); //清空文本框
        }

        $scope.isnullmsg = false;
        //下拉刷新操作。加载历史的消息
        $scope.doRefresh = function () {
            mylimit += 10;
            // console.log($rootScope.docAvatarurl);
            //聊天记录查询和显示
            $http({
                method: 'post',
                url: "http://localhost/medicalsys/webchat/chatmsg/getChatMsgList?page=1&start=0&limit=" + mylimit + "&sendId=" + $rootScope.a.userid + "&recvId=" + $rootScope.a.toUserId + "&reads=" + "0,1"
            }).success(function (data) {
                if (data) {
                    if (data.total == data.roots.length) {
                        $scope.isnullmsg = true;
                    } else {
                        $scope.isnullmsg = false;
                    }
                    $rootScope.xsHisMsg = data.roots;

                    // console.log($rootScope.xsHisMsg);
                    $scope.showRead = true;
                    $("#content").empty();
                } else {
                    ZENG.msgbox.show("获取数据失败", 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            }).finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }

        $scope.getPatientMess = function (userId) {
            $http({
                method:'post',
                url:'http://localhost/medicalsys/doctors/patientInfo/getPatientByUser?userId='+$rootScope.a.toUserId
            }).success(function (ret) {
                if(ret.success){
                    $scope.chatPatientList = ret.roots;
                    // console.log($scope.chatPatientList);
                }else{
                    ZENG.msgbox.show(ret.errorMessage,1,1500);
                }
            }).error(function (ret) {
                ZENG.msgbox.show('获取病人数据失败！',1,1500);
            })
        }
        $scope.getPatientMess();
        $ionicModal.fromTemplateUrl('chatBR-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.chatBRModal = modal;
        });
        $scope.selectChatBR = function () {
            // console.log($scope.chatBR);
            $scope.getAge($scope.chatBR);
            $scope.chatBRModal.show();
            $scope.getChatBRpres($scope.chatBR.id);
        }
        $scope.cfRecode = {};
        $scope.cfshowIndex = [];  // 每条数据的展开状态
        $scope.getChatBRpres = function (pid) {
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
                console.info($scope.cfPatientMess);
                console.info($scope.chufangRecodes);
            }).error(function (data) {
                // console.log(data);
                ZENG.msgbox.show('获取数据失败！', 1, 1500);
            })
        }
        $scope.showRecodeDetail = function (index, pid, times,prescriptionSn) {
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
                        YPtempDatas[i] = temp;
                    }
                    $scope.cfRecode[index] = a[0];
                    YPtempDatas['herbalAmount'] = a[0].herbalAmount;
                    $scope.cfRecode[index]['yc'] = YPtempDatas
                    // console.log($scope.cfRecode[index]);
                }).error(function (data) {
                    // console.log(data);
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                })
            }
        }
        $scope.loadJCD = function(pid,oid){
            /*@patientId，--病人ID；@orderId，--订单ID*/
            $http({
                method:'get',
                url:'http://localhost/medicalsys/empPatient/attchements/getBrCheckLists?patientId=' + pid + "&userType=0&orderId=" + oid
            }).success(function (data) {
                // console.log(data);
                if (data.success){
                    $scope.pImages = data.roots
                    // 初始化 使其默认显示检查单
                    $scope.showPic = [];
                    $('#JCD1').css({
                        'background-color':'#ae7649',
                        'color':'white'
                    });
                    $('#JCD2').css({
                        'background-color':'white',
                        'color':'#ae7649'
                    });
                    $('#JCD3').css({
                        'background-color':'white',
                        'color':'#ae7649'
                    });
                    $scope.imgTitle = '检 查 单';
                    for(var i in $scope.pImages){
                        if($scope.pImages[i].type == 1){
                            $scope.showPic.push($scope.pImages[i]);
                        }
                    }
                }else{
                    ZENG.msgbox.show(data.errorMessage,1,1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show('获取数据失败！',1,1500);
            });
            $scope.JCDmodal.show();
        }
        $ionicModal.fromTemplateUrl('JCDmodal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.JCDmodal = modal;
        });
        $ionicModal.fromTemplateUrl('mypic2-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal2 = modal;
        });
        $scope.getAge = function (chatBR) {
            var bir,current,birYear,currentYear,birMonth,currentMonth,BRage;
            bir = chatBR.birthday;
            current = new Date(dateService.getServerDate()).getTime();
            birYear = $filter('date')(bir,'yyyy');
            currentYear = $filter('date')(current,'yyyy');
            birMonth = $filter('date')(bir,'MM');
            currentMonth = $filter('date')(current,'MM');
            BRage = currentMonth<birMonth?(currentYear-birYear-1):(currentYear-birYear);
            $scope.chatBR['age'] = BRage;
        }
        $scope.drugOnline = function (a) {
            // 跳转到线上抓药页面
            $rootScope.uid=a.toUserId;
            $rootScope.userName=a.toUserName;
            locals.setObject('form','');
            $location.path('/app/kaifan');
        }
        $scope.showJCD = function (type,imgTitle,$event) {
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
            for(var i in $scope.pImages){
                if($scope.pImages[i].type == type){
                    $scope.showPic.push($scope.pImages[i]);
                }
            }
        }
        $scope.picshow2 = function (item,title) {
            $scope.title = title;
            $scope.modal2.show();
            $scope.item = item;
        };
    })

    .factory('timezone', function ($rootScope, $http, $q) {
        //  var timezones = {
        //      searchtime: function(timez){
        //          $http({
        //              method:'get',
        //              url:'http://localhost/medicalsys/sys/dataDict/getDataDictByCategory?category='+timez
        //          }).success(function(data){
        //              // console.log(data);
        //              if(data.success){
        //                  return data.categoryType;
        //              }
        //          }).error(function(data){
        //              console.log(data);
        //          });
        //      }
        //  };
        //  return timezones;
        function searchtime(timez) {
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/sys/dataDict/getDataDictByCategory?category=' + timez
            }).success(function (data) {
                if (data.success) {
                    deferred.resolve(data.categoryType);
                }
            }).error(function (data) {
                deferred.reject();
            });
            // console.log('return promise');
            return promise;

        }

        return {
            searchtime: searchtime
        };
    })


    //获取科室，职称等字段
    .service('docparam', function ($http, $q) {
        this.getparam = function (typ) {
            var delay = $q.defer(),
                promis = delay.promise;
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/sys/dataDict/getDataDictByCategory?category=' + typ
            }).success(function (data) {
                if (data.success) {
                    delay.resolve(data);
                }
            }).error(function (data) {
                delay.reject(data);
            });
            return delay.promise;
        };

    })

    //mainController 后退操作，退出操作，关闭websocket操作  注意的：返回和退出都要调用：closeScoket
    .controller('mainController', function ($scope, $rootScope, $ionicPopup, $http, $location, $ionicHistory, locals) {

        //聊天页面返回刷新工作室列表
        $scope.refushlist = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studio/getDoctorStudioMessageList?id=' + $rootScope.loginUserId,
            }).success(function (datas) {
                // console.info("聊天后退去刷新下消息");
                // console.info(datas.roots);
                $rootScope.drlists = datas.roots;
            })
                .error(function (datas) {
                    // console.info("后退获取消息失败！");
                    // console.info(datas);
                })
        }

        //关闭webscoket
        $scope.closeScoket = function () {
            // console.log($rootScope.dotMess);
            if ($rootScope.myWs) {
                $http({
                    method: 'GET',
                    url: 'http://localhost/medicalsys/webscoket/chat/offLine?userId=' + $rootScope.a.userid + '&studioId=' + $rootScope.a.toUserId,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data.success) {
                        // console.info(data.result);
                        $rootScope.myWs.close();
                        // console.info("WebScoket已关闭！上面是返回的信息。");
                    }
                }).error(function () {
                });
            }
        };

        //后退操作
        $scope.logout = function () {
            //      $http({
            //          method: 'POST',
            //          url: 'http://localhost/medicalsys/logout',
            //          headers: {
            //              'Content-Type': 'application/x-www-form-urlencoded'
            //          }
            //      }).success(function(datas) {
            //          locals.set("locallogged", false);
            //          console.info("退出，并注销local");
            //          $location.path('/app/login');
            //      }).error(function() {
            //          alert('退出异常');
            //      });
            //  };

            $rootScope.myPopup = $ionicPopup.confirm({
                template: "确定退出登陆状态？",
                title: '提示',
                buttons: [{
                    text: '取消'

                }, {
                    text: '确定',
                    type: 'button-positive',
                    onTap: function (e) {
                        return 1;
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    $http({
                        method: 'POST',
                        url: 'http://localhost/medicalsys/logout'
                    }).success(function (datas) {
                        if (datas) {
                            $location.path('/app/login');
                            locals.set("doclocallogged", false);
                            // console.log(locals.get("doclocallogged", ""));
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    });

                }
            });

        }

        $scope.Alert = function (msg) {
            $rootScope.myPopup = $ionicPopup.alert({
                title: 'Warning Message',
                template: msg
            });
        };

        $scope.backToMain = function () {
            $location.path('/app/main');
        }
    })

    //dotOrderController 预约病人
    .controller('dotOrderController', function ($scope, $rootScope, $http, $location, $filter, locals, numtostr, $ionicLoading, $ionicPopup, $q, $interval, loadDatePbService,dateService) {
        var now = new Date(dateService.getServerDate());
        var lastEvent='';
        $scope.isSelect = false;
        $scope.orderList = []; // 显示在前端的数组
        $scope.whichday = new Date(dateService.getServerDate()).getDate();
        var nowTime = now.getTime();
        var day = now.getDay();
        var oneDayLong = 24 * 60 * 60 * 1000;
        var MondayTime = nowTime - (day - 1) * oneDayLong;
        var today = new Date(nowTime);
        var zhou = 0;
        var init = function () {
            $scope.morning = "上午";
            $scope.noon = "中午";
            $scope.afternoon = "下午";
            $scope.evening = "晚上";
            $rootScope.week1 = '周' + numtostr.fun(day);
            $rootScope.week2 = '周' + numtostr.fun(((day + 1) > 7 ? (day + 1) - 7 : (day + 1)));
            $rootScope.week3 = '周' + numtostr.fun(((day + 2) > 7 ? (day + 2) - 7 : (day + 2)));
            $rootScope.week4 = '周' + numtostr.fun(((day + 3) > 7 ? (day + 3) - 7 : (day + 3)));
            $rootScope.week5 = '周' + numtostr.fun(((day + 4) > 7 ? (day + 4) - 7 : (day + 4)));
            $rootScope.week6 = '周' + numtostr.fun(((day + 5) > 7 ? (day + 5) - 7 : (day + 5)));
            $rootScope.week7 = '周' + numtostr.fun(((day + 6) > 7 ? (day + 6) - 7 : (day + 6)));
            $rootScope.wek1 = 'WEEK.' + numtostr.fun1(day);
            $rootScope.wek2 = 'WEEK.' + numtostr.fun1((day + 1) > 7 ? (day + 1) - 7 : (day + 1));
            $rootScope.wek3 = 'WEEK.' + numtostr.fun1((day + 2) > 7 ? (day + 2) - 7 : (day + 2));
            $rootScope.wek4 = 'WEEK.' + numtostr.fun1((day + 3) > 7 ? (day + 3) - 7 : (day + 3));
            $rootScope.wek5 = 'WEEK.' + numtostr.fun1((day + 4) > 7 ? (day + 4) - 7 : (day + 4));
            $rootScope.wek6 = 'WEEK.' + numtostr.fun1((day + 5) > 7 ? (day + 5) - 7 : (day + 5));
            $rootScope.wek7 = 'WEEK.' + numtostr.fun1((day + 6) > 7 ? (day + 6) - 7 : (day + 6));
            //这7天的日期对象  日期格式： day1：2016-09-09
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0);
            $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
            $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);
            $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
            $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5);
            $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
            $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');
        }
        init();
        //上下周操作
        beginWeek = 0;
        var weeknum = 0;
        //选择上周
        $scope.lastPb = function () {
            $scope.orderList3 = [];
            weeknum--;
            // $('#tab td').css("border", "solid 1px #AE7649");
            $scope.tableChoose = '';
            beginWeek--;
            nowWeek = beginWeek * 7;
            changedate = nowTime + (nowWeek + 7 * zhou) * oneDayLong;
            $scope.whichday = new Date(changedate).getDate();
            //这7天的日期对象  日期格式： day1：2016-09-09
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0 + nowWeek + 7 * zhou);
            $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 + nowWeek + 7 * zhou);
            $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2 + nowWeek + 7 * zhou);
            $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3 + nowWeek + 7 * zhou);
            $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4 + nowWeek + 7 * zhou);
            $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5 + nowWeek + 7 * zhou);
            $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6 + nowWeek + 7 * zhou);
            $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');
            // 加载一周数据
            $scope.getDatas($scope.day1, $scope.day7);
        }
        //选择下周
        $scope.nextPb = function () {
            $scope.orderList3 = [];
            weeknum++;
            // $('#tab td').css("border", "solid 1px #AE7649");
            $scope.tableChoose = '';
            beginWeek++;
            nowWeek = beginWeek * 7;
            changedate = nowTime + (nowWeek + 7 * zhou) * oneDayLong;
            $scope.whichday = new Date(changedate).getDate();

            //这7天的日期对象  日期格式： day1：2016-09-09
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0 + nowWeek + 7 * zhou);
            $scope.day1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 + nowWeek + 7 * zhou);
            $scope.day2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2 + nowWeek + 7 * zhou);
            $scope.day3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3 + nowWeek + 7 * zhou);
            $scope.day4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4 + nowWeek + 7 * zhou);
            $scope.day5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5 + nowWeek + 7 * zhou);
            $scope.day6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6 + nowWeek + 7 * zhou);
            $scope.day7 = $filter('date')(day7, 'yyyy-MM-dd');
            // 加载一周数据
            $scope.getDatas($scope.day1, $scope.day7);
        }
        var organizeData = function (oDatas, bt, et) {
            /*
             * @oDatas 就诊数据
             * @bt 开始日期
             * @et 结束日期
             * */
            // console.log(oDatas);
            //定义数组用于匹配星期相对应的id
            var now = new Date(dateService.getServerDate());
            nowWeek = beginWeek * 7;
            var nowTime = now.getTime();
            var day = now.getDay();
            var oneDayLong = 24 * 60 * 60 * 1000;
            var MondayTime = nowTime - (day - 1) * oneDayLong;
            var today = new Date(nowTime);
            var day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 0 + nowWeek + 7 * zhou);
            var wek1 = $filter('date')(day1, 'yyyy-MM-dd');
            var day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 + nowWeek + 7 * zhou);
            var wek2 = $filter('date')(day2, 'yyyy-MM-dd');
            var day3 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2 + nowWeek + 7 * zhou);
            var wek3 = $filter('date')(day3, 'yyyy-MM-dd');
            var day4 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3 + nowWeek + 7 * zhou);
            var wek4 = $filter('date')(day4, 'yyyy-MM-dd');
            var day5 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4 + nowWeek + 7 * zhou);
            var wek5 = $filter('date')(day5, 'yyyy-MM-dd');
            var day6 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5 + nowWeek + 7 * zhou);
            var wek6 = $filter('date')(day6, 'yyyy-MM-dd');
            var day7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6 + nowWeek + 7 * zhou);
            var wek7 = $filter('date')(day7, 'yyyy-MM-dd');
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

            //加载动画
            $ionicLoading.show({
                content: '加载中...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            //清空之前的排班
            for (var j = 0; j < dataweek.length; j++) {
                var s = angular.element(document.getElementById(dataweek[j].id));
                s[0].innerHTML = '';
                s[0].style.backgroundColor = "";
            }
            mydate = [];
            //加载这一周的排班情况
            for (var j = 0; j < oDatas.length; j++) {
                if ((oDatas)[j].status != 5) {
                    mydate.push((oDatas)[j]);
                }
            }
            //回显到表格上。显示已经排班
            for (var i = 0; i < mydate.length; i++) {
                //获取到的是 “周一上午”
                var pb = mydate[i].reserDate + "" + mydate[i].timeTypeText;
                // console.info("需要渲染的时间段：" + pb); //日期+下午
                for (var j = 0; j < dataweek.length; j++) {
                    var s = angular.element(document.getElementById(dataweek[j].id));
                    //匹配的要渲染格子
                    s.css("color","#ae7649");
                    if (pb == dataweek[j].name) {
                        if (s[0].innerHTML == ''){
                            s[0].innerHTML = 0;
                        }
                        s[0].innerHTML = parseInt(s[0].innerHTML)+1;
                        break;
                    }
                }
            }
            $ionicLoading.hide();
            return;
        }
        var filterDatas = function (fDatas,period) {
            $scope.orderList3 = []; // 显示在前端的数组
            // 显示某一个时间段的就诊记录
            for(var i=0;i<fDatas.length;i++){
                if(fDatas[i].timeTypeText == period){
                    $scope.orderList3.push(fDatas[i]);
                }
            }
        }
        $scope.getDatas = function (startDate, endDate) { // 获取一周预约数据
            drdate = new Date(dateService.getServerDate()).getTime();
            if($rootScope.loginUserId == undefined){
                // 浏览器刷新$rootScope.loginUserId会被清空，判断为undefined获取本地缓存的ID；
                $rootScope.loginUserId = locals.get('doclocaluserid');
            }
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/orders/orderinfo/getAppOrderPageList?type=0&userType=1&_dc=' + drdate + '&page=1&start=0&limit=50&userId=' + $rootScope.loginUserId + '&startTime=' + startDate + '&endTime=' + endDate,
                //      + '&status=1'
            }).success(function (datas) {
                // console.log(datas);
                // 显示表格数据
                organizeData(datas.roots, startDate, endDate);
            }).error(function (datas) {
                // console.log(datas);
            })
        }
        $scope.getDatas($scope.day1, $scope.day7);
        $scope.dotYY = function (date, week, period,$event) {
            /*
             * @date 日期
             * @week 星期
             * @period 时间段（上中下 午）
             * @元素事件（获取id改变样式）
             * */
            $scope.tipTitle = date+" "+period;
            $scope.isSelect = true;
            $('.DO_tb_td').css({
                "border": "solid 1px #AE7649",
                "background-color": "#f1f0ef",
                "color": "#ae7649"
            });
            $($event.target).css("background-color", "#AE7649");//修改这次点击的td的样式
            $($event.target).css("color", "white");
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/orders/orderinfo/getAppOrderPageList?type=0&userType=1&_dc='
                + drdate + '&page=1&start=0&limit=20&userId='+$rootScope.loginUserId+'&startTime='+date+'&endTime='+date,
            }).success(function (datas) {
                filterDatas(datas.roots,period);
                lastEvent = $event;
            }).error(function (datas) {
                // console.log(datas);
            })
        }
        $scope.orderMess = function (order) {
            $rootScope.cOrderMess = order;
            $rootScope.sickId = order.binrId;
            $rootScope.docHisId = order.docHisId;
            $rootScope.pname=order.binrName;
            $rootScope.studioHisId = order.studioHisId;
            $rootScope.times = order.times || 1;

            // console.info("times" + $rootScope.times);
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
                url: 'http://localhost/medicalsys/empPatient/attchements/getBrCheckLists?patientId=' + $rootScope.sickId + "&userType=0&orderId=" + order.id
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
                    $location.path("/app/pdetail");
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
    })

    //sickMessController 患者详情
    .controller('sickMessController', function ($scope, $rootScope, $http, $location, $filter, $ionicModal,dateService) {

        $scope.showBigImg = false;

        //初始默认大图是隐藏的
        $scope.hideBigImage = function () {
            $scope.showBigImg = false;
        };

        //图片放大功能
        $scope.picshow2 = function (path) {
            // console.log(path);
            $scope.imgUrl = path;
            $scope.showBigImg = true;
        }

        //取消看诊
        $scope.qxSeeDot = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/mzsys/updateClinicRoom?roomId=000|000|000&updateFlag=1&flag=&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&doctorCode=' + $rootScope.docHisId + '&reserId=' + $rootScope.reserId+'&pname'+$rootScope.pname,
            }).success(function (data) {
                if (data.success) {
                    console.info(data);
                    ZENG.msgbox.show(data.result, 1, 1500);
                    var now = new Date(dateService.getServerDate());
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
        $scope.sm1 = $scope.sm2 = $scope.sm3 = false;
        $scope.showsm = function (n) {
            if (n == 1) {
                $scope.sm1 = !$scope.sm1;
            }
            if (n == 2) {
                $scope.sm2 = !$scope.sm2;
            }
            if (n == 3) {
                $scope.sm3 = !$scope.sm3;
            }
        }
        //图片放大缩小
        $ionicModal.fromTemplateUrl('mypic-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.picshow = function (item, title) {
            $scope.title = title;
            // console.log(item);
            $scope.modal.show();
            $scope.item = item;
        };

        $scope.picshowa = function ($event) {
            // console.log("why");
            // console.log($event.target);
            var hrefstr = $($event.target).attr("src");
            hrefstr = hrefstr.replace("http://image.tcmtrust.com/", "[");
            $scope.item = {};
            $scope.item.content = hrefstr;
            $scope.modal.show();
        };

        $scope.closeModal = function () {
            $scope.modal.hide();
        };
//Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            // $scope.modal.remove();
        });
// Execute action on hide modal
        $scope.$on('modal.hidden', function () {
            // Execute action
        });
// Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });

        $scope.resize = function (item) {
            $scope.imgUrl = item;
            $scope.showBigImg = true;
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


        //提交按钮
        $scope.blAzd = function () {
            //更新看病状态为正在看诊
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/mzsys/updateClinicRoom?roomId=000|000|000&updateFlag=3&flag=&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&doctorCode=' + $rootScope.docHisId+'&pname='+$rootScope.pname,
            }).success(function (data) {
                if (data.success) {
                    // console.info("后台更新状态为正在看诊！");
                    $location.path("/app/dotdiag");
                    // $location.path("/app/diagnosisOnline");
                } else {
                    // console.info(data);
                    // console.info('上传失败！');
                }
            }).error(function (data) {
                // console.info(data);
                // console.log('error');
            });
        }

        // 查看处方记录
        $scope.seeMedicalRecords = function (pid) {
            // console.log('病人ID：' + pid);
            $location.url('/app/seeMedicalRecords?pid=' + pid);
        }

        $scope.sign = 1;
        $scope.BQ = function () {
            $scope.sign = 1;
        }
        $scope.JCD = function () {
            $scope.sign = 2;
        }

        /* 暂时屏蔽
        $scope.dochat = function (item) {
            // 根据userID获取用户信息
            $http({
                method:'post',
                url:'http://localhost/medicalsys/sys/user/getWxUserInfo?userId='+item.userId
            }).success(function (data) {
                // console.log(data);
                $scope.tempUserdata = data;
                // 获取医生信息
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/doctors/doctorInfo/getDoctorByUser',
                }).success(function (datas) {
                    $scope.tempDocData = datas.roots[0];
                    // console.log($scope.tempDocData);
                    $rootScope.xsHisMsg = [];
                    $rootScope.toChatName = $scope.tempUserdata.nickName;
                    $rootScope.unread = 0;
                    $rootScope.a = {};
                    $rootScope.a.userid = $scope.tempDocData.studioId;
                    $rootScope.a.userName = $scope.tempDocData.name;
                    $rootScope.a.fromStudioName = $scope.tempDocData.studioName;
                    $rootScope.a.fromStudioId = $scope.tempDocData.studioId;
                    $rootScope.a.toUserId =  $scope.tempUserdata.id;
                    $rootScope.a.toUserName =  $scope.tempUserdata.nickName;
                    $rootScope.chatUserHeaderUrl =  $scope.tempUserdata.headerUrl;
                    // 中文转码
                    // var url = 'http://localhost/medicalsys/webscoket/chat/LoginSocket?userId=' + $rootScope.a.userid + '&username=' + $rootScope.a.userName + "&fromType=1&studioId=" + $rootScope.a.fromStudioId + "&fromStudioName=" + $rootScope.a.fromStudioName
                    var url = 'http://localhost/medicalsys/webscoket/chat/LoginSocket?userId=' + $rootScope.a.userid + '&username=' + $rootScope.a.userName + "&fromType=1&studioId=" + $rootScope.a.toUserId + "&studioName=" + $rootScope.a.toUserName
                    $http({
                        method: 'get',
                        url: url
                    }).success(function (data) {
                        if (data) {
                            $location.path('/app/mymsgde');
                        } else {
                            ZENG.msgbox.show(data.errorMessage, 1, 1500);
                        }

                    }).error(function (datas) {
                        ZENG.msgbox.show(datas.errorMessage, 5, 1500);
                    });
                }).error(function (data) {
                    // console.log(data);
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                });
            }).error(function (data) {
                console.log(data);
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        };*/

        $scope.dotorder = function () {
            $location.path('/app/dotorder');
        }
    })

    //dotDiagController 病例+诊断
    .controller('dotDiagController', function ($scope, $rootScope, $http, FileUploader, $filter, $timeout, $ionicPopup, $ionicModal, $location, locals,dateService) {
        $rootScope.kf='普通';
        $scope.tempT = {'1':0,'2':0,'3':0}; // 用于限制上传图片图标
        $scope.showList = [0,0,0,0]; // 用于标识搜索四种诊断结果div的显示状态
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/mzsys/getBl?flag=0&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&recordSn=1'
        }).success(function (data) {
            if (data.success) {
                if (data.roots.length != 0 && data.roots != undefined) {
                    // console.log(data);
                    $scope.bz.sickBl = (data.roots)[0].blRecord;
                    if($scope.bz.sickBl == undefined || $scope.bz.sickBl == 'undefined')
                        $scope.bz.sickBl = '';
                }
            }
        }).error(function (data) {
            // console.log(data);
        });

        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/mzsys/getBl?flag=1&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&recordSn=1'
        }).success(function (data) {
            if (data.success) {
                if (data.roots.length != 0 && data.roots != undefined) {
                    // console.log(data);
                    $scope.bllist = data.roots;
                }
            }
        }).error(function (data) {
            // console.log(data);
        });

        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/mzsys/getPatientIcd?pid=' + $rootScope.hisId + '&times=' + $rootScope.times
        }).success(function (data) {
            if (data.success) {
                if(data.roots.length==0)return;
                // console.log(data);
                $scope.bz.mainZD = (data.roots)[0].icdName;
                $scope.bz.minorZD = (data.roots)[0].icdName2;
                $scope.bz.zyZD = (data.roots)[0].icdName1;
                $scope.bz.zx = (data.roots)[0].icdName3;
                $scope.bzmainZD = (data.roots)[0].icdCode;
                $scope.bzminorZD = (data.roots)[0].icdCode2;
                $scope.bzzyZD = (data.roots)[0].icdCode1;
                $scope.bzzx = (data.roots)[0].icdCode3;
            }
        }).error(function (data) {
            // console.log(data);
        });

        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/mzsys/getVisitList?pid=' + $rootScope.hisId + '&doctorCode=' + $rootScope.docHisId + '&begindt=2016-01-30&enddt=2017-12-31'
        }).success(function (data) {
            if (data.success) {
                // console.log(data);
            }
        }).error(function (data) {
            // console.log(data);
        });

        $scope.showList = false;
        //取消看诊
        $scope.qxSeeDot = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/mzsys/updateClinicRoom?roomId=000|000|000&updateFlag=1&flag=&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&doctorCode=' + $rootScope.docHisId+'&pname'+$rootScope.pname,
            }).success(function (data) {
                if (data.success) {
                    // console.info(data);
                    ZENG.msgbox.show("取消看诊", 1, 1500);
                    var now = new Date(dateService.getServerDate());
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
                    // console.info('失败！');
                }
            }).error(function (data) {
                // console.info(data);
                // console.log('error');
            });
        }

        //保存选择照片的操作
        locals.set("typ", 1);
        $scope.pits = "1";
        $scope.setty = function (x) {
            locals.set("typ", x);
            $scope.pits = x;
        };

        //选择图片
        $scope.limit = function () {
            $scope.showList = true;

            var tnum = 0;
            var t = locals.get("typ");
            // console.info(uploader);
            var arrup = uploader.queue;
            for (var a in arrup) {
                if ((arrup[a].formData)[0].picType == t) {
                    tnum++;
                }
                if (tnum >= 3) {
                    $rootScope.myPopup = $ionicPopup.confirm({
                        template: "同种类型的图片上传数不得超过3张",
                        title: '提示',
                        buttons: [{
                            text: '确定',
                            type: 'button-positive',
                            onTap: function (e) {
                                return 1;
                            }
                        },]
                    });
                    event.preventDefault();
                    return;

                }
            }

        };

        $scope.picfilter = function (item) {
            // console.log(uploader.queue);
            // 统计各个类型的图片数量
            statisPic(uploader.queue);
            pit = locals.get("typ", "");
            return (item.formData)[0].picType == pit;
        };

        // 统计各个类型的图片数量
        var statisPic = function (data) {
            // $scope.tempT = [0,0,0];
            $scope.tempT = {'1': 0, '2': 0, '3': 0};
            var picType;
            for (var i = 0; i < data.length; i++) {
                // console.log(data[i].formData[0].picType);
                picType = data[i].formData[0].picType;
                $scope.tempT[picType] += 1;
            }
            // console.log($scope.tempT);
        }

        var uploader = $scope.uploader = new FileUploader({
            url: 'http://localhost/medicalsys/empPatient/attchements/upLoad',
            formData: [{
                userType: '',
                zyzd: '',
                cyzd: '',
                brbl: '',
                orderId: '',
                picType: 0
            }],
            removeAfterUpload: true,
        });

        uploader.filters.push({
            name: 'imageFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        uploader.onAfterAddingFile = function (fileItem) {
            // console.info(fileItem);
            t = locals.get("typ", "");
            // console.log(t);
            var timestamp = new Date(dateService.getServerDate());
            fu = new Date(dateService.getServerDate()).toString("yyyyMMddHHmmssfff");
            // console.log(fu);
            // console.log(timestamp);
            chte = $filter('date')(timestamp, 'yyyyMMddHHmmss.sss');
            chte = chte.split(".");
            chtime = chte[0] + chte[1];
            pt = (fileItem._file.name).split(".");
            // console.log(chtime);
            fileItem.file.name = chtime + "_" + t + "." + pt[1];
            // console.log(fileItem._file.name);
            // console.info('onAfterAddingFile', fileItem);
            (fileItem.formData)[0].picType = t;
            if (fileItem._file.lastModified == undefined) {
                fileItem._file.lastModified = new Date(dateService.getServerDate()).getTime();
            }
            (fileItem.formData)[0].picTime = fileItem._file.lastModified;
            (fileItem.formData)[0].userType = 1;
            // console.log(fileItem);
        };

        uploader.onCompleteAll = function () {
            // console.info('onCompleteAll');
        };

        //删除图片
        $scope.removeIMg = function () {
            // console.info("删除图片" + uploader.queue.length);
            var a = uploader.queue;
            a.pop();
            if (uploader.queue.length == 0) {
                $scope.showList = false;
            }
        };

        $ionicModal.fromTemplateUrl('templet.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $scope.clear = function () {
            $scope.bz.sickBl = '';
        };

        $scope.cleara = function (n) {
            $scope.showList = [0,0,0,0];
            if (n == 1) {
                $scope.bz.mainZD = '';
                $scope.bzmainZD = '';
            }
            if (n == 2) {
                $scope.bz.minorZD = '';
                $scope.bzminorZD = '';
            }
            if (n == 3) {
                $scope.bzzyZD = '';
                $scope.bz.zyZD = '';
            }
            if (n == 4) {
                $scope.bzzx = '';
                $scope.bz.zx = '';
            }
        };
        $scope.showbl = false;
        $scope.showbllist = function () {
            $scope.showbl = !$scope.showbl;
        };

        $scope.addbl = function (o) {
            $scope.bz.sickBl = o.blRecord;
        }

        $scope.seletetemplet = function () {
            $scope.branch = 'medirecord';
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getMZTemplates?doctorCode=' + $rootScope.docHisId
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                    $scope.medirecords = data.roots;
                } else {
                    // console.log("异常");
                }
            }).error(function () {
                // console.log("error");
            });

            $scope.modal.show();
        };

        $scope.addrec = function (n) {
            // console.log(n);
            $scope.bz.sickBl = n.templates;
            $scope.modal.hide();
        };

        $scope.search = function (n) {

        };
        //展开历史处方

        $scope.downdiag = function () {
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getIcd'
            }).success(function (data) {
                if (data) {
                    // console.log(data);
                    diaglist = data.children;
                    locals.setObject("diaglist", diaglist);
                    $scope.diaglist = diaglist;
                } else {
                    // console.log("异常");
                }
            }).error(function () {
                // console.log("error");
            });
        };
        $scope.openkey = [];
        $scope.openkeya = [];
        $scope.openkeyb = [];
        $scope.openkeyc = [];
        $scope.open = function (o, c) {
            // console.log(o);
            if (c == 1) {
                var indexkey = o.$$hashKey;
                if (($scope.openkey)[indexkey] == true) {
                    ($scope.openkey)[indexkey] = false;
                } else {
                    ($scope.openkey)[indexkey] = true;
                }
            }
            if (c == 2) {
                var indexkey = o.$$hashKey;
                if (($scope.openkeya)[indexkey] == true) {
                    ($scope.openkeya)[indexkey] = false;
                } else {
                    ($scope.openkeya)[indexkey] = true;
                }
            }
            if (c == 3) {
                var indexkey = o.$$hashKey;
                if (($scope.openkeyb)[indexkey] == true) {
                    ($scope.openkeyb)[indexkey] = false;
                } else {
                    ($scope.openkeyb)[indexkey] = true;
                }
            }
            if (c == 4) {
                var indexkey = o.$$hashKey;
                if (($scope.openkeyc)[indexkey] == true) {
                    ($scope.openkeyc)[indexkey] = false;
                } else {
                    ($scope.openkeyc)[indexkey] = true;
                }
            }
        };

        // 新增 用于诊断选择处理
        $scope.open2 = function (item, isLeaf, num) {
            if (isLeaf) { // 叶子，直接添加
                $scope.addtotem(item);
            } else {
                $scope.open(item, num);
            }
        }
        // $scope.addtem = function (which) {
        //     $scope.branch = 'diag';
        //     $scope.main = which;
        //     $scope.diaglist = locals.getObject("diaglist");
        //     $scope.modal.show();
        // };
        $scope.addtotem = function (n) {
            if ($scope.main == "mainZD") {
                // console.log(n);
                $scope.bz.mainZD = n.name;
                $scope.bzmainZD = n.id;
                $scope.modal.hide();
            }
            if ($scope.main == "minorZD") {
                // console.log(n);
                $scope.bz.minorZD = n.name;
                $scope.bzminorZD = n.id;
                $scope.modal.hide();
            }
            if ($scope.main == "zyZD") {
                // console.log(n);
                $scope.bz.zyZD = n.name;
                $scope.bzzyZD = n.id;
                $scope.modal.hide();
            }
            if ($scope.main == "zx") {
                // console.log(n);
                $scope.bz.zx = n.name;
                $scope.bzzx = n.id;
                $scope.modal.hide();
            }
            $scope.modal.hide();
        };

        $scope.addsecond = function () {
            $scope.branch = 'diag';
            $scope.main = false;
            $scope.diaglist = locals.getObject("diaglist");
            $scope.modal.show();

        };

        $scope.remove = function () {
            $scope.bz.minorZD = '';
        };

        $scope.bz = {};
        $scope.allFileUpload = function () {
            if ($scope.bz.minorZD == undefined) { // 西医第二诊断
                $scope.bz.minorZD = '';
            }
            if ($scope.bz.mainZD == undefined) { // 西医第一诊断
                $scope.bz.mainZD = '';
            }
            if ($scope.bz.zyZD == undefined) { // 中医诊断
                $scope.bz.zyZD = '';
            }
            if ($scope.bz.zx == undefined) { // 症型
                $scope.bz.zx = '';
            }
            if ($scope.bz.sickBl == undefined) { // 病历
                $scope.bz.sickBl = '';
            }
            // console.info("提交。");
            $rootScope.sickBl = $scope.bz.sickBl;
            $rootScope.mainZD = $scope.bz.mainZD;
            $rootScope.minorZD = $scope.bz.minorZD;
            $rootScope.zyZD = $scope.bz.zyZD;
            $rootScope.zx = $scope.bz.zx;
            console.info($rootScope.sickBl + " " + $rootScope.mainZD + " " + $rootScope.minorZD + " " + $rootScope.zyZD + " " + $rootScope.zx);

            //没有添加图片
            if (uploader.queue.length == 0) {
                console.info("没有选择图片");
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/empPatient/attchements/' +
                    'upLoadNoImage?brbl=' + $scope.bz.sickBl + '&zyzd=' + $scope.bzmainZD + '&zyzdText=' + $scope.bz.mainZD + '&cyzd=' + $scope.bzminorZD + '&cyzdText=' + $scope.bz.minorZD + '&zyizd=' + $scope.bzzyZD + '&zyizdText=' + $scope.bz.zyZD + '&zx=' + $scope.bzzx +
                    '&zxText=' + $scope.bz.zx + '&orderId=' + $rootScope.orderId + '&userType=1&patientId=' + $rootScope.patientId + '&remark=' + '' + '&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&recordDept=' + $rootScope.studioHisId + '&recordOpera=' + $rootScope.docHisId +
                    '&recordSn=1' + '&picType=&picTime=',
                }).success(function (data) {
                    if (data) {
                        // console.info(data);
                        // console.log('upload success');
                        //发第二次请求
                        $http({
                            method: 'post',
                            url: 'http://localhost/medicalsys/empPatient/attchements/upLoadFinish?orderId=' + $rootScope.orderId + '&userType=1&patientId=' + $rootScope.patientId
                        }).success(function (data) {
                            if (data) {
                                // console.info(data);
                                // console.log('upLoadFinish success');
                                // $location.path("/app/sugUse");
                                $location.path("/app/sugUse2");
                            } else {
                                // console.info(data);
                                // console.info('upLoadFinish fail！');
                            }
                        }).error(function (data) {
                            // console.info(data);
                            // console.log('error');
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

            for (i = 0; i < uploader.queue.length; i++) {
                ((uploader.queue)[i].formData)[0].brbl = $scope.bz.sickBl;
                ((uploader.queue)[i].formData)[0].zyzd = $scope.bzmainZD;
                ((uploader.queue)[i].formData)[0].cyzd = $scope.bzminorZD;
                ((uploader.queue)[i].formData)[0].zyizd = $scope.bzzyZD;
                ((uploader.queue)[i].formData)[0].zx = $scope.bzzx;
                ((uploader.queue)[i].formData)[0].zyzdText = $scope.bz.mainZD;
                ((uploader.queue)[i].formData)[0].cyzdText = $scope.bz.minorZD;
                ((uploader.queue)[i].formData)[0].zyizdText = $scope.bz.zyZD;
                ((uploader.queue)[i].formData)[0].zxText = $scope.bz.zx;
                ((uploader.queue)[i].formData)[0].orderId = $rootScope.orderId;
                ((uploader.queue)[i].formData)[0].remark = '';
                ((uploader.queue)[i].formData)[0].patientId = $rootScope.patientId;
                ((uploader.queue)[i].formData)[0].pid = $rootScope.hisId;
                ((uploader.queue)[i].formData)[0].times = $rootScope.times;
                ((uploader.queue)[i].formData)[0].recordDept = $rootScope.studioHisId;
                ((uploader.queue)[i].formData)[0].recordOpera = $rootScope.docHisId;
                ((uploader.queue)[i].formData)[0].recordSn = 20 + (i++);
            }

            uploader.uploadAll();
            uploader.onCompleteAll = function onCompleteAll() {
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/empPatient/attchements/upLoadFinish?orderId=' + $rootScope.orderId + '&userType=1&patientId=' + $rootScope.patientId,
                }).success(function (data) {
                    if (data.success) {
                        // console.info(data);
                        // $location.path("/app/sugUse");
                        ZENG.msgbox.show('上传图片成功！', 1, 1500);
                        $location.path("/app/sugUse2");
                    } else {
                        // console.info(data);
                        ZENG.msgbox.show('上传图片失败！', 1, 1500);
                    }
                }).error(function (data) {
                    // console.info(data);
                    // console.log('error');
                });
            };
        }
        $scope.backTopdetail = function () {
            $location.path('/app/pdetail');
        }
        $scope.searchZD = function(type,index){
            $scope.showList = [0,0,0,0];
            $scope.main = type;
            var val = $scope.bz[type]
            if (val == "") {
                $scope.findZD = [];
                return;
            }
            if (val.length >= 3 || val.charCodeAt() > 255) {
                val = val.toUpperCase();
                $http({
                    method: 'get',
                    url: 'http://localhost/medicalsys/mzsys/getIcd2?code=' + val + '&flag=0'
                }).success(function (data) {
                    console.log(data);
                    $scope.findZD = data.children;
                    $scope.showList[index] = 1;
                }).error(function (data) {
                    ZENG.msgbox.show('获取数据错误！', 1, 1500);
                })
            }
        }
        $scope.choseZD = function (item,type) {
            $scope.showList = [0,0,0,0];
            $scope.bz[type] = item.text;
            $scope.addtotem(item);
        }
        $scope.getFocus = function (index) {
            $scope.showList = [0,0,0,0];
        }
    })
    //sugUseController 建议用药
    .controller('sugUseController', function ($scope, $rootScope, $http, $ionicModal, $ionicPopup, $location, $ionicScrollDelegate, $filter, $timeout, locals,$q,loadingService,dataServComm,dateService) {
        var arrindex = 0, nowindex = 0;
        $scope.showMethod = false;
        $scope.showfYc = false; //显示药材搜寻结果
        $scope.herbalAmount = 1; //药材多少味
        $scope.totalPrice = 0; //总金额
        $scope.showHis = false; //处方详细
        $scope.comments = ["焗服", "包煎", "炒", "冲服", "打碎", "后下", "化服", "另包", "另炒", "吞服", "外洗", "先煎", "烊化"];
        $scope.showaddpre = [];
        ($scope.showaddpre)[arrindex] = [];
        ($scope.showaddpre)[arrindex].list = [];
        ($scope.showaddpre)[arrindex].herbalAmount = 1;
        $scope.showchoose =[];
        if($rootScope.chufang && $rootScope.chufang.length!=0){
            ($scope.showaddpre[arrindex])=$scope.showchoose =$rootScope.chufang;
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }

        // 获取本次看诊已开最大处方序号
        $http({
            method:'get',
            timeout:60000,
            url:'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid=' + $rootScope.sickId + '&times=' + $rootScope.times
        }).success(function (data) {
            if(data){
                var objcf = data.list0.preList;
                objcf = eval('(' + objcf + ')');
                // console.log($scope.prelists);
                if (objcf == '' || objcf == undefined) {
                    if($rootScope.kf=='快捷'){
                        if($rootScope.lishicf==1){
                            $scope.premax=2;
                            $rootScope.lishicf=0;
                        }
                    }else{
                        $scope.premax = 2;
                    }
                } else {
                    var max = 1;
                    for (var l in objcf) {
                        if (parseInt((objcf)[l].prescriptionSn) >= max) {
                            max = parseInt((objcf)[l].prescriptionSn);
                        }
                    }
                    // console.log(max);
                    if($rootScope.kf=='快捷'){
                        if($rootScope.lishicf==1){
                            $scope.premax=2;
                            $rootScope.lishicf=0;
                        }else{
                            $scope.premax = parseInt(max) + 1;
                        }
                    }else{
                        $scope.premax = parseInt(max) + 1;
                    }
                }
            }else{
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show('获取数据错误！', 5, 1500);
        });

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
            // url:'http://localhost/medicalsys/mzsys/getChargeItem?sValue=DA' // 暂时用此URL替代
            url: 'http://localhost/medicalsys/mzsys/getDoctorYP?doctorCode=' + $rootScope.docHisId
        }).success(function (data) {
            // console.log(data);
            $scope.dcComYC = data.roots; // 医生常开药材
        }).error(function (data) {
            // console.log(data);
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        })

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
                        // console.log(data);
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
                                    if($rootScope.kf=='快捷'){
                                        if($rootScope.lishicf==1){
                                            $scope.premax=2;
                                            $rootScope.lishicf=0;
                                        }
                                    }else{
                                        $scope.premax = 2;
                                    }
                                } else {
                                    var max = 1;
                                    for (var l in $scope.prelists) {
                                        if (parseInt(($scope.prelists)[l].prescriptionSn >= max)) {
                                            max = parseInt(($scope.prelists)[l].prescriptionSn);
                                        }
                                    }
                                    // console.log(max);
                                    if($rootScope.kf=='快捷'){
                                        if($rootScope.lishicf==1){
                                            $scope.premax=2;
                                            $rootScope.lishicf=0;
                                        }else{
                                            $scope.premax = parseInt(max) + 1;
                                        }
                                    }else{
                                        $scope.premax = parseInt(max) + 1;
                                    }
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
            } else {
                return;
            }
        }

        // //添加历史处方
        // $scope.adcf = function (item) {
        //     // console.log(item);
        //     $http({
        //         method: 'get',
        //         url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?flag=2&pid=' + item.pid + '&times=' + item.times + '&prescriptionSn=' + item.prescriptionSn
        //     }).success(function (data) {
        //         if (data) {
        //             $scope.showaddpre[arrindex].list.splice(0, $scope.showaddpre[arrindex].list.length);
        //             $scope.showaddpre[arrindex].list = JSON.parse(data.list);
        //             $scope.showchoose = $scope.showaddpre[arrindex];
        //             $scope.totalPrice = sunTotal($scope.showchoose);
        //             $scope.isshowcf = false;
        //             $scope.s = false;
        //         } else {
        //             // console.log(data.errorMessage);
        //         }
        //     }).error(function (data) {
        //         // console.log(data.errorMessage);
        //     });
        // }
        //
        // // 查看历史处方
        // $scope.checkcf = function (item) {
        //     // 获取病人历史处方详细
        //     $http({
        //         method: 'get',
        //         url: 'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + item.pid + '&times=' + item.times + '&accountSn=0&prescriptionSn=' + item.prescriptionSn + '&flag=2&dataType=0'
        //     }).success(function (data) {
        //         // console.log(data);
        //     }).error(function (data) {
        //         // console.log(data);
        //     })
        // }

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
        $scope.usYF = function (flag,type) {
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
                    // console.log(data);
                    $scope.cfdetails = data.roots;
                }
            }).error(function () {
                // console.log("error");
            });
        };

        //选择病人历史药方
        $scope.allYF = function () {
            $scope.seletem = 'history';
            // console.info("调用药方大全");
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
        $scope.serch = function () {
            // console.log(val);
            val=$scope.findYC;
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
            } else if(n<=1){
                alert('药材克数不能小于等于0');
            }
            else {
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

        // 从搜索中选中的药材
        $scope.choseYc = function (yc) {
            // console.info(yc);
            if (yc.dosage == undefined) {
                yc.dosage = 5;
            }
            $scope.selectedyc = yc;
            var findex = arrindex;
            // console.log(nowindex);
            $scope.showfYc = false;
            //      $ionicScrollDelegate.scrollBottom();
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
                        // $scope.getFocus();
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
                    if($scope.checkIsAdd($scope.selectedyc)) return;
                    ($scope.showaddpre)[findex].list.push($scope.selectedyc);
                    $scope.showchoose = ($scope.showaddpre)[findex];
                    $scope.totalPrice = sunTotal($scope.showchoose);
                    $scope.allprice = $scope.alladd($scope.showaddpre);
                    $rootScope.chufang=($scope.showaddpre)[findex];
                    // console.log($scope.allprice);
                }
            })

        }
        // 检查药材是否已经添加
        $scope.checkIsAdd = function (selectedyc) {
            for(var i in $scope.showchoose.list){
                if (selectedyc.chargeCode === $scope.showchoose.list[i].chargeCode){
                    ZENG.msgbox.show(selectedyc.chargeName+' 已经添加！',1,1500);
                    return true;
                }
            }
            return false;
        }
        // 从医生常开药材中选
        $scope.choseYc2 = function (yc) {
            // console.info(yc);
            $http({
                method: 'get',
                url: 'http://localhost/medicalsys/mzsys/getChargeItem?sValue=' + yc.chargeCode,
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
            //      $ionicScrollDelegate.scrollBottom();
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
                    if($scope.checkIsAdd($scope.selectedyc)) return;
                    ($scope.showaddpre)[findex].list.push($scope.selectedyc);
                    $scope.showchoose = ($scope.showaddpre)[findex];
                    $scope.totalPrice = sunTotal($scope.showchoose);
                    $scope.allprice = $scope.alladd($scope.showaddpre);
                    $rootScope.chufang=($scope.showaddpre)[findex];
                    // console.log($scope.allprice);
                }
            })
        }

        //编辑药材
        $scope.edityc = function (y) {
            $scope.selectedyc = y;
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/medic.html",
                title: '添加药材',
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
                    // 检查药材是否已经添加
                    if($scope.checkIsAdd($scope.selectedyc)) return;
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
                $rootScope.chufang=($scope.showaddpre)[arrindex];
            } else {
                return;
            }
        }

        // 删除所有已选药材
        $scope.delYCAll = function () {
            if ($scope.showchoose.list.length == 0 || $scope.showchoose.list.length == undefined) {
                alert('请先添加药材！');
                return;
            }
            if (confirm("确定删除所有已选药材吗？")) {
                $scope.showchoose.list = [];
                $scope.showchoose = [];
                $rootScope.chufang=[];
                $scope.totalPrice = 0;
            } else {
                return;
            }
        }

        //选择规格
        $scope.chooseval = function (n, $event) {
            $scope.selectedyc.dosage = n;
            $($event.target).parent().children().removeClass("cv");
            $($event.target).addClass("cv");
        }

        //添加药材数量（添加处方付数）
        $scope.addNum = function () {
            // console.log($scope.showchoose.list);
            if ($scope.showchoose.list == undefined) {
                ZENG.msgbox.show('请添加处方药材', 1, 1500);
                return;
            }
            $scope.yaoFangNumsArrTemp = $scope.yaoFangNumsArr;
            ($scope.showaddpre)[arrindex].herbalAmount++;
            $scope.herbalAmount = ($scope.showaddpre)[arrindex].herbalAmount;
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }

        //减少药材数量（减少处方付数）
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
            }
            $scope.totalPrice = sunTotal($scope.showchoose);
            $scope.allprice = $scope.alladd($scope.showaddpre);
        }

        $scope.changePreNum = function (changePreNum) {//监听付数的选择并将其同步到原来的($scope.showaddpre)[arrindex].herbalAmount的属性
            ($scope.showaddpre)[arrindex].herbalAmount = changePreNum;
            $scope.herbalAmount = changePreNum;
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
                    var mc = (chooseYc.list)[i].origPrice * chooseYc.herbalAmount * (chooseYc.list)[i].dosage;
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
            $($event.target).parent().children().css("color", "#ae7649").css("background-color", "white").css("border-right", "solid 1px white");
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

        // 本地保存处方药材
        var localSaveYCdata = function (chooseYc) {
            //获取本地存储的处方药材数据
            var localYC = locals.get('localYC');
            console.log(localYC);
            if (localYC == '' || localYC == undefined){
                localYC = [];
                localYC.push(chooseYc);
            }else{
                localYC = JSON.parse(localYC);
                localYC.push(chooseYc);
            }
            //序列化数组才能保存
            localYCJson = JSON.stringify(localYC);
            locals.set('localYC',localYCJson);
            console.log(localYC);
        }

        //提交用药建议
        $scope.overSug = function () {
            if ($scope.showchoose.list == undefined) {
                ZENG.msgbox.show('请添加处方药材', 1, 1500);
                return;
            }
            loadingService.showLoading();
            var deferred = $q.defer();
            var promise = deferred.promise;
            if($rootScope.kf=='快捷'){
                if($rootScope.Cyy==1){
                    pid=$rootScope.sickId;//病人id
                    studioId =$rootScope.studioId;//工作室id
                    $scope.url='http://localhost/medicalsys/mzsys/saveFastAppOrder?pid='+pid+'&studioId='+studioId+'&operType=3';
                    $http({
                        method:'post',
                        url:$scope.url
                    }).success(function(data){
                        console.log('预约成功！');
                        $rootScope.Cyy=0;
                        $rootScope.times=data.data.times || 1;
                        deferred.resolve();
                    }).error(function(){
                        loadingService.hideLoading();
                    })
                }else{
                    deferred.resolve();
                }

            }else{
                deferred.resolve();
            }
            promise.then(function (result){
                var chooseArr = [];
                var chooseJson = {};
                $rootScope.chooseYc = [];
                for (var o = 0; o < $scope.showaddpre.length; o++) {
                    for (var p = 0; p < ($scope.showaddpre)[o].list.length; p++) {
                        ($scope.showaddpre[o].list)[p].prescriptionSn = $scope.premax + o;
                        ($scope.showaddpre[o].list)[p].detaiSn = p + 1;
                        ($scope.showaddpre[o].list)[p].herbalAmount = $scope.showaddpre[o].herbalAmount;
                        $rootScope.chooseYc.push(($scope.showaddpre[o].list)[p]);
                    }
                }
                if ($rootScope.chooseYc.length == 0) {
                    ZENG.msgbox.show("请添加药材！", 1, 1500);
                    return;
                }
                // $rootScope.currentChooseYc = $rootScope.chooseYc;
                localSaveYCdata($rootScope.chooseYc);//
                $rootScope.currentPrescriptionSn = $rootScope.chooseYc[0].prescriptionSn;
                for (var i = 0; i < $rootScope.chooseYc.length; i++) {
                    chooseJson = {}; //每次只提交一条数据给数组，所以每次要置空。
                    chooseJson['pid'] = $rootScope.hisId; // 病人门诊系统ID
                    chooseJson['times'] = $rootScope.times; //就诊次数
                    chooseJson['prescriptionSn'] = $rootScope.chooseYc[i].prescriptionSn; // 处方序号
                    chooseJson['detaiSn'] = $rootScope.chooseYc[i].detaiSn; // 药材（饮片)序号
                    chooseJson['chargeCode'] = $rootScope.chooseYc[i].chargeCode; // 药材（饮片)编号
                    chooseJson['serialNo'] = $rootScope.chooseYc[i].serialNo; // 项目规格
                    chooseJson['groupNo'] = $rootScope.chooseYc[i].groupNo; // 收费项目组类型
                    chooseJson['recordOpera'] = $rootScope.docHisId; // 开方医生编号
                    chooseJson['chargeAmount'] = $rootScope.chooseYc[i].dosage; // 药材（饮片）结算数量
                    chooseJson['herbalAmount'] = $scope.herbalAmount; // 药材（饮片）副数
                    // chooseJson['herbalAmount'] = $rootScope.chooseYc[i].herbalAmount;
                    chooseJson['dosage'] = $rootScope.chooseYc[i].dosage; // 药材（饮片）用量
                    chooseJson['dosageUnit'] = $rootScope.chooseYc[i].dosageUnit; // 药材（饮片）用量单位编号
                    chooseJson['supplyCode'] = $rootScope.chooseYc[i].supplyCode; // 药材（饮片）用法
                    chooseJson['freqCode'] = "";
                    chooseJson['persistDays'] = null;
                    if($rootScope.chooseYc[i].comment==null || $rootScope.chooseYc[i].comment == 'null' || $rootScope.chooseYc[i].comment == undefined){
                        $rootScope.chooseYc[i].comment = '';
                    }
                    chooseJson['comment'] = $rootScope.chooseYc[i].comment; // 药材（饮片）特殊用法
                    chooseJson['applyDept'] = $rootScope.studioHisId; // 开方工作室studioHisID
                    // console.info(chooseJson);
                    chooseArr.push(chooseJson);
                }
                var arryJson = {};
                arryJson['detailList'] = chooseArr;
                var detailList = JSON.stringify(arryJson);
                console.log(detailList);
                //传给预览的数据
                $rootScope.falTotalPrice = $scope.totalPrice;
                $rootScope.falHerbalAmount = $scope.herbalAmount;
                $rootScope.chufang = [];
                $http({
                    method: 'POST',
                    url: 'http://localhost/medicalsys/mzsys/AddAppDetail',
                    data: detailList
                }).success(function (data){
                    if (data.success) {
                        // console.log('提交处方成功');
                        $location.path("/app/showsug");
                    } else {
                        ZENG.msgbox.show(data.errorMessage, 1, 1500);
                    }
                    loadingService.hideLoading();
                }).error(function (data) {
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    loadingService.hideLoading();
                });
                // loadingService.hideLoading();
                // $location.path("/app/showsug");
            });
        }

        //取消看诊
        $scope.qxSeeDot = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/mzsys/updateClinicRoom?roomId=000|000|000&updateFlag=1&flag=&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&doctorCode=' + $rootScope.docHisId + '&patientId=' + $rootScope.sickId + '&userType=1&orderId=' + $rootScope.orderida+'&pname'+$rootScope.pname,
            }).success(function (data) {
                if (data.success) {
                    // console.info(data);
                    ZENG.msgbox.show("取消看诊", 1, 1500);
                    var now = new Date(dateService.getServerDate());
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
                ZENG.msgbox.show('获取数据失败！',1,1500);
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

    //showSugController 诊断和处方预览
    .controller('showSugController', function ($scope, $rootScope, $location, $http, $ionicPopup,locals,$q) {
        //快递费
        $scope.falKd = 10.00;
        // 获取本次就诊的历史处方
        var getHisMess = function () {
            $http({
                method:'get',
                url:'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=1&pid='+$rootScope.sickId+'&times='+$rootScope.times
            }).success(function (data) {
                if(data.len){
                    // $scope.lcData = data.list0.preList
                    var a = JSON.parse(data.list0.preList);
                    $scope.cfPresList = a;
                    $scope.loadHisCF($scope.cfPresList);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage,1,1500);
            })
        }
        getHisMess();// 加载本次就诊历史处方
        var getPresDetail = function (data) { // 加载处方详细
            var deferred = $q.defer();
            var promise = deferred.promise;
            $http({
                method:'get',
                url:'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid=' + data.pid + '&times=' + data.times + '&accountSn=0&prescriptionSn=' + data.prescriptionSn + '&flag=2&dataType=0'
            }).success(function (ret,status,headers,config) {
                if(ret.list){
                    var tempArr = {};
                    tempArr = JSON.parse(ret.list)
                    if(data.payStatusText == '已支付 '){
                        tempArr['payStatusText'] = '已付';
                    }else{
                        tempArr['payStatusText'] = '未付';
                    }
                    tempArr['prescriptionSn'] = tempArr[0].prescriptionSn;
                    deferred.resolve(tempArr);
                }else{deferred.reject();}
            }).error(function (ret,status,headers,config) {
                ZENG.msgbox.show(ret.errorMessage,1,1500);
                deferred.reject();
            });
            return promise;
        }
        $scope.loadHisCF = function (cfPresList) {
            $scope.lcData = [];
            for(var i in cfPresList){
                var promise = getPresDetail(cfPresList[i]);
                promise.then(function(data){//调用承诺接口resolove()
                    if(data.length){
                        $scope.lcData.push(data);
                    }
                    console.log($scope.lcData);
                },function(data){//调用承诺接口reject();
                    console.log(data);
                    ZENG.msgbox.show('加载处方数据错误！');
                });
            }
        }

        $scope.showFinish = function () {
            var url = 'http://localhost/medicalsys/mzsys/updateClinicRoom?roomId=000|000|000&updateFlag=4&flag=&pid=' + $rootScope.hisId + '&times=' + $rootScope.times + '&doctorCode=' + $rootScope.docHisId + '&reserId=' + $rootScope.reserId+'&pname='+$rootScope.pname;
            $http({
                method:'post',
                url:url
            }).success(function (data) {
                // console.log(data);
                ZENG.msgbox.show(data.result,1,1500);
            }).error(function (data) {
                // console.log(data);
                ZENG.msgbox.show(data.result,1,1500);
            });
            $rootScope.Cyy=1;
            $location.path('/app/dotorder');
            locals.setObject('form','');
        };

        $scope.goToSugUse3 = function (chooseYc) {
            $rootScope.updatePre = chooseYc;
            $location.path('/app/sugUse3');
        }

        $scope.addCF = function () {
            // $location.path('app/sugUse');
            $location.path('app/nSugUse');
        }
        //计算总价
        var sunTotal = function (lc) {
            var faltotal = 0;
            for (var i = 0; i < lc.length; i++) {
                //console.info(chooseYc[i].chargeAmount);
                if (lc[i].dosage == undefined) {
                    return faltotal;
                }
                if (lc[i].origPrice != null || undefined) {
                    var mc = parseFloat(lc[i].origPrice) * parseFloat(lc[i].herbalAmount) * parseFloat(lc[i].dosage);
                    faltotal += mc;
                }
            }
            return faltotal;
        }
        $scope.selectCF = function (lc,$event) {
            $scope.chooseYc = lc;
            $rootScope.currentPrescriptionSn = lc.prescriptionSn;
            // 计算处方价钱
            $rootScope.falTotalPrice = sunTotal(lc);
            // $($event.target).css('background-color','white').css('color','#ae7649');
            // $(".cfNum").css({
            //     "background-color": "white",
            //     "color": "#ae7649"
            // })
            // $($event.target).css({
            //     "background-color": "forestgreen",
            //     "color": "white"
            // });
        }
        //删除处方
        $scope.delcf = function (y) {
            if (confirm("确定删除该处方吗？")) {
                $http({
                    method: 'get',
                    url: 'http://localhost/medicalsys/mzsys/delDetail?pid=' + y[0].pid + '&times=' + y[0].times + '&prescriptionSn=' + y.prescriptionSn
                }).success(function (data) {
                    if (data.success) {
                        ZENG.msgbox.show('删除处方成功！',1,1500);
                        $scope.lcData = [];
                        getHisMess();
                        $scope.loadHisCF($scope.cfPresList);
                        $rootScope.currentPrescriptionSn = $scope.lcData[0].prescriptionSn;
                        $rootScope.chooseYc = $scope.lcData[0];
                    }
                }).error(function (data) {
                    ZENG.msgbox.show(data.errorMessage, 5, 1500);
                });
            } else {
                return;
            }
        }
    })
    .directive('resov', function ($compile) {
        return {
            restrict: 'AE',
            scope: {
                resovmessage: '=',
                picshowa: '&',
            },
            link: function (scope, tElement, tAttrs) {
                // console.log(tElement);
                // console.log(scope.resovmessage);
                var rg = /\[\\(?=([^\[]*\.[a-zA-Z]{2,3}\]))/g;
                var rgm = /\]/g;
                htmladd = scope.resovmessage.replace(rg, "<img style='float:right; width:200px; height:200px;' src='http://image.tcmtrust.com/\\").replace(rgm, "' ng-click='picshowa({item:$event})'>");
                htmladd = "<div>" + htmladd + "</div>"
                $(tElement).append($compile(htmladd)(scope));
            },
        };
    })

    //ngThumb 图片显示的指令
    .directive('ngThumb', ['$window', function ($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function (item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function (file) {
                var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function (scope, element, attributes) {
                if (!helper.support) return;
                var params = scope.$eval(attributes.ngThumb);
                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;
                var canvas = element.find('canvas');
                var reader = new FileReader();
                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({
                        width: width,
                        height: height
                    });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                }
            }
        };
    }])

    //signController 判断医生是否登录，帮助看病的患者进行扫码签到操作
    .controller('signController', function ($scope, $http, $location, $ionicPopup, $interval, locals) {
        //判断用户是否已经登陆过，有则直接拉取缓存自动登录
        var islog = locals.get("doclocallogged");
        if (islog == 'true') {
            lcn = locals.get("doclocalusername", "");
            lcw = locals.get("doclocalpassword", "");
            // console.log(lcn + lcw);
            $scope.lcformData = {
                username: lcn,
                password: lcw,
                userType: 0
            };
            $http({
                method: 'POST',
                url: 'http://localhost/medicalsys/login',
                data: $.param($scope.lcformData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Origin': '*'
                }
            }).success(function (data) {
                if (data.success) {
                    ZENG.msgbox.show("自动登录成功", 4, 1500);
                    //UserService.isLogged = true;
                    $rootScope.aa = $scope.lcformData.username;
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }
        //解析当前扫码的url，得到相应参数调用签到接口
        var sparseJSON = new Object();
        var sargs = new Object();
        var urlsign = window.location.href;
        // console.log(urlsign);
        var sort = urlsign.substring(urlsign.indexOf('?') + 1);
        var orid = sort.split("&");
        for (var i = 0; i < orid.length; i++) {
            var pos = orid[i].indexOf('=');
            if (pos == -1)
                continue;
            var argname = orid[i].substring(0, pos);
            var value = orid[i].substring(pos + 1);
            value = decodeURIComponent(value);
            sargs[argname] = value;
        }
        id = sargs.id;
        times = sargs.times;
        user = sargs.user;

        $http({
            method: 'post',
            url: 'http://localhost/medicalsys/orders/orderinfo/reservation?orderId=' + id
        }).success(function (data) {
            if (data.success) {
                // console.log(data);
                $rootScope.myPopup = $ionicPopup.confirm({
                    template: user + "已签到成功",
                    title: '提示！',
                    buttons: [{
                        text: '确定',
                        type: 'button-balanced',
                        onTap: function (e) {
                            return 1;
                        }
                    },]
                })
            } else {
                // console.log("ll");
            }
        }).error(function () {
            // console.log("22");
        });
    })

    //dotRoomLocController 工作室地址
    .controller('dotRoomLocController', function ($scope, $rootScope, $ionicPopup, $http, $location, $timeout, $sce, province, docService,dateService) {
        var url = window.location.href;
        path = url.split("#")[0];
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/paysys/wechat/getPackageValue?type=1&path=' + path
        }).success(function (data) {
            if (data) {
                // console.log(data);
                $rootScope.wxdata = data;
                wx.config({
                    debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                    appId: $rootScope.wxdata.appId, // 必填，公众号的唯一标识
                    timestamp: $rootScope.wxdata.timeStamp, // 必填，生成签名的时间戳
                    nonceStr: $rootScope.wxdata.nonceStr, // 必填，生成签名的随机串
                    signature: $rootScope.wxdata.paySign, // 必填，签名，见附录1
                    jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'chooseImage', 'openLocation', 'getLocation'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                });
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 1, 1500);
        });

        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByDocId',
        }).success(function (data) {
            if (data) {
                // console.log(data);
                $scope.adlist = data.list;
            } else {
                // console.log("出现异常");
            }
        }).error(function () {
            // console.log("出现错误");
        });
        //待验证
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/doctors/studio/getStudioListByAccountId?zdoctor=' + $rootScope.zdcid,
        }).success(function (data) {
            if (data) {
                // console.info(data);
                $scope.dotList = data.list;
                $scope.sharedata = data.list[0];
                // 一加载数据马上默认分享第一个工作室
                // $scope.share($scope.sharedata);
                var imgurl = docService.docavatar.replace(/\\/g, "\/");
                window.event ? window.event.cancelBubble = true : e.stopPropagation();
                if (typeof(WeixinJSBridge) !== "undefined") {
                    wx.ready(function () {
                        wx.onMenuShareAppMessage({
                            title: docService.studio,
                            desc: docService.skills, // 店铺名
                            link: 'http://localhost/user/#/app/docinfo?code=' + $scope.sharedata.code+ '&type=1', // 商品购买地址
                            imgUrl: imgurl,// 分享的图标
                            success: function () {
                            },
                            fail: function (res) {
                                alert(JSON.stringify(res));
                            }
                        });
                    });
                }
            } else {
                ZENG.msgbox.show("获取数据失败", 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });

        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/sys/dataDict/getDataDictByCategory?category=PERCENT'
        }).success(function (data) {
            if (data.success) {
                $scope.feePercentOne = data.categoryType[0].name + "%";
                $scope.feePercentTwo = data.categoryType[1].name + "%";
            } else {
                ZENG.msgbox.show(data.errorMessage, 1, 1500);
            }
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
        });

        $scope.getloca = function (item) {
            wx.openLocation({

                latitude: 23.15615, // 纬度，浮点数，范围为90 ~ -90

                longitude: 113.26929, // 经度，浮点数，范围为180 ~ -180。

                name: "至诚金方", // 位置名

                address: "广州市白云区政民路5号至诚金方", // 地址详情说明

                scale: 28, // 地图缩放级别,整形值,范围从1~28。默认为最大

                infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转

            });
            // wx.getLocation({
            //     type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            //     success: function (res) {
            //         $scope.saveloca(item, res.latitude, res.longitude);
            //     },
            //     error:function (ret) {
            //         console.log(ret);
            //     }
            // });
        }

        $scope.saveloca = function (item, latitude, longitude) {
            $scope.ad = {
                id: item.id,
                version: item.version,
                name: item.name,
                phone: item.phone,
                status: item.status,
                address: item.address,
                xDegree: latitude,
                yDegree: longitude
            };

            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioAddress/saveOrUpdate',
                data: $.param($scope.ad),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (data) {
                if (data.success) {
                    ZENG.msgbox.show("定位成功", 4, 1500);
                } else {
                    ZENG.msgbox.show(data.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        }

        $scope.showP = function () {
            $scope.sp = true;
        }
        //地址管理
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
                            // console.log("添加成功");
                            $http({
                                method: 'get',
                                url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByDocId'
                            }).success(function (data) {
                                if (data) {
                                    // console.log(data);
                                    $scope.adlist = data.list;
                                } else {
                                    // console.log("出现异常");
                                }
                            }).error(function () {
                                // console.log("出现错误");
                            });
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
                            // console.log("编辑成功");
                            $http({
                                method: 'get',
                                url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByDocId',
                            }).success(function (data) {
                                if (data) {
                                    // console.log(data);
                                    $scope.adlist = data.list;
                                } else {
                                    // console.log("出现异常");
                                }
                            }).error(function () {
                                // console.log("出现错误");
                            });

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
                            // console.log("删除成功");
                            $http({
                                method: 'get',
                                url: 'http://localhost/medicalsys/doctors/studioAddress/getStudioAddressByDocId',
                            }).success(function (data) {
                                if (data) {
                                    // console.log(data);
                                    $scope.adlist = data.list;
                                } else {
                                    // console.log("出现异常");
                                }
                            }).error(function () {
                                // console.log("出现错误");
                            });
                        } else {
                            // console.log("删除失败");
                        }
                    }).error(function () {
                        // console.log("系统错误");
                    });
                }
            });
        };

        $scope.reg = {};
        $scope.dotRoomReg = function () {
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/doctors/studioAddress/saveOrUpdate',
                data: $.param($scope.reg),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (datas) {
                if (datas.success) {
                    // console.info(datas);
                    ZENG.msgbox.show("添加成功", 4, 1500);
                    //$location.path('/app/dotroom');
                } else {
                    // console.info(datas);
                    ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                }
            }).error(function (data) {
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            });
        };

        $scope.getcflist = function () {
            var xc = parseInt("6:30");
            // console.log(xc);
        };
        $scope.hashkey = {};
        $scope.off = true;
        //工作室管理
        $scope.drLoc = function (dr) {
            $scope.off = !$scope.off;
            var index = dr.$$hashKey;
            if (($scope.hashkey)[index] == undefined || ($scope.hashkey)[index] == false) {
                ($scope.hashkey)[index] = true;
            } else {
                ($scope.hashkey)[index] = false;
            }
            ;
            if (!$scope.off) {
                $http({
                    method: 'post',
                    url: 'http://localhost/medicalsys/doctors/doctorInfo/getDocListByStudioId?studioId=' + dr.id,
                }).success(function (data) {
                    if (data) {
                        // console.log(data);
                        $scope.doclist = data.roots;
                    }
                }).error(function (data) {
                    // console.log(data.errorMessage);
                });
            }
        }

        //分享工作室  //改为默认第一个工作室
        $scope.share = function (n) {
            $scope.stuname = n.name;
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
        };

        //创建工作室
        $scope.addstu = function () {
            $scope.adridarrcopy = [];
            $scope.stu = {};
            $scope.stu.id = "";
            $scope.stu.version = "";
            $scope.stu.code = "";
            $scope.stu.status = 1;
            $scope.stu.showindex = "";
            $scope.adridarr = [];
            adrsarrstr = "";

            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/stupop.html",
                title: '编辑你的工作室地址',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '保存',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (JSON.stringify($scope.adridarrcopy) == "[]") {
                            ZENG.msgbox.show("请至少选择一个出诊地址", 1, 1500);
                            e.preventDefault();
                        } else {
                            return 1;
                        }
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    for (k = 0; k < $scope.adridarrcopy.length; k++) {
                        adrsarrstr = adrsarrstr + ($scope.adridarrcopy)[k];
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
                            // console.info("创建成功");
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
                                ZENG.msgbox.show(data.errorMessage, 5, 1500);
                            });
                        } else {
                            ZENG.msgbox.show(data.errorMessage, 1, 1500);
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.erroMsg, 5, 1500);
                    });
                }
            });
        };

        //编辑工作室
        $scope.editstu = function (it) {
            window.event ? window.event.cancelBubble = true : e.stopPropagation();
            $scope.stu = {};
            $scope.adridarrcopy = [];
            adrsarrstr = "";
            $scope.stu.id = it.id;
            $scope.stu.version = "";
            $scope.stu.code = it.code;
            $scope.stu.name = it.name;
            $scope.stu.firstdiagnosis = it.firstdiagnosis;
            $scope.stu.treatmentfee = it.treatmentfee;
            $scope.stu.status = it.status;
            $scope.stu.showindex = "";
            if (it.addressIds == undefined) {
                $scope.adridarr = [];
            } else {
                $scope.adridarr = it.addressIds;
            }
            for (i = 0; i < $scope.adridarr.length; i++) {
                m = "&addressIds=" + ($scope.adridarr)[i];
                $scope.adridarrcopy.push(m);
            }
            for (var i = 0; i < $scope.adridarr.length; i++) {
                for (var j = 0; j < $scope.adlist.length; j++) {
                    if (($scope.adridarr)[i] == ($scope.adlist)[j].id) {
                        ($scope.adlist)[j].checked = true;
                        break;
                    }
                }
            }
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/stupop.html",
                title: '编辑你的工作室地址',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: '取消',
                }, {
                    text: '保存',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (JSON.stringify($scope.adridarrcopy) == "[]") {
                            ZENG.msgbox.show("请至少选择一个出诊地址", 1, 1500);
                            e.preventDefault();
                        } else {
                            return 1;
                        }
                    }
                },]
            });
            $rootScope.myPopup.then(function (res) {
                if (res) {
                    for (k = 0; k < $scope.adridarrcopy.length; k++) {
                        adrsarrstr = adrsarrstr + ($scope.adridarrcopy)[k];
                    }
                    paramstr = $.param($scope.stu) + adrsarrstr;
                    $http({
                        method: 'post',
                        url: 'http://localhost/medicalsys/doctors/studio/saveStudio',
                        data: paramstr,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).success(function (datas) {
                        if (datas.success) {
                            ZENG.msgbox.show('保存成功！',1,1500);
                            $scope.sadreshow = false;
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
                                ZENG.msgbox.show(data.errorMessage, 5, 1500);
                            });

                            //$location.path('/app/dotroom');
                        } else {
                            // console.info(datas);
                            ZENG.msgbox.show(datas.errorMessage, 1, 1500);
                        }
                    }).error(function (data) {
                        ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    });
                } else {
                    // console.log("取消");
                }
            });
        };

        //删除工作室
        $scope.delstu = function (t) {
            window.event ? window.event.cancelBubble = true : e.stopPropagation();
            // console.log(t);
            $rootScope.myPopup = $ionicPopup.confirm({
                template: "此操作不可恢复，确定？",
                title: '删除该工作室',
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
                if (res) {
                    $http({
                        method: 'post',
                        url: 'http://localhost/medicalsys//doctors/studio/delDoctorStudio?id=' + t.id,
                    }).success(function (data) {
                        if (data) {
                            // console.info("删除成功");
                            $scope.sadreshow = false;
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
                                ZENG.msgbox.show(data.errorMessage, 5, 1500);
                            });
                        } else {
                            ZENG.msgbox.show(data.errorMessage, 1, 1500);
                        }
                    }).error(function (data) {
                        // console.info(data)
                        ZENG.msgbox.show(data.errorMessage, 5, 1500);
                    });
                }
            });
        };

        $scope.userFollow = function (dr) {
            // window.event ? window.event.cancelBubble = true : e.stopPropagation();
            // $rootScope.docRoomDatas = dr;
            $location.url('app/fastPres');
        }

        // 地址与收费
        $scope.addrAndChar = function (firstdiagnosis,treatmentfee) {
            /*
             * @firstdiagnosis,--线上诊金（首诊诊金）
             * @treatmentfee,  --线下诊金（复诊诊金）
             * */
            $rootScope.dotList = $scope.dotList;
            $rootScope.firstdiagnosis = firstdiagnosis;
            $rootScope.treatmentfee = treatmentfee;
            $location.path('/app/addrAndChar');
        }
        /*新增 LMJ 查看圈子*/
        $scope.showCircle = function (studioId, studioName) { //查看圈子
            var cDate = dateService.fomatDate(new Date());
            var Atoken = $rootScope.aa + "zcjk" + cDate;
            Atoken = MD5(MD5(Atoken));
            // 连接圈子
            $rootScope.circleUrl = $sce.trustAsResourceUrl("http://quanzi.tcmtrust.com/mobi/wxcircledetail.html?Ausername=" +
                $rootScope.aa + "&studioId=" + studioId + "&studioName=" + studioName + "&Atoken=" + Atoken + "&type=2");
            $location.path('app/ifra');
        }
        /* LMJ end*/

        $scope.prov = province;
        // console.log($scope.prov);
        //添加地址
        $scope.addadress = function () {
            $scope.sadreshow = true;
            for (var i = 0; i < $scope.adridarr.length; i++) {
                for (var j = 0; j < $scope.adlist.length; j++) {
                    if (($scope.adridarr)[i] == ($scope.adlist)[j].id) {
                        ($scope.adlist)[j].checked = true;
                        break;
                    }
                }
            }

        };

        $scope.manageadr = function () {
            $location.path("app/manageadr");
        };

        $scope.addadrs = function (i) {
            //      adrsarr = $scope.adridarrcopy;
            // console.log(i);
            n = "&addressIds=" + i.id;
            if (i.checked == true) {
                $scope.adridarrcopy.push(n);
            }
            if (i.checked == false || i.checked == undefined) {
                n = "&addressIds=" + i.id;
                for (var l in $scope.adridarrcopy) {
                    if (($scope.adridarrcopy)[l] == n) {
                        $scope.adridarrcopy.splice(l, 1);
                    }
                }
            }
            // console.log($scope.adridarrcopy);
            //      adrsarrstr.substring(0,adrsarrstr.length-1);
        };

        //  $scope.repay = function(x) {
        //      console.log(x.id);
        //      console.log($scope.adridarr);
        //      for(h = 0; h < $scope.adridarr.length; h++) {
        //          if(($scope.adridarr)[h] == x.id) {
        //              return true;
        //          }
        //      }
        //  };

        $scope.checkall = function () {
            $scope.adridarrcopy.splice(0, $scope.adridarrcopy.length);
            for (i = 0; i < $scope.adlist.length; i++) {
                ($scope.adlist)[i].checked = true;
                m = "&addressIds=" + ($scope.adlist)[i].id;
                $scope.adridarrcopy.push(m);
            }
            // console.log($scope.adridarrcopy);
        };

        $scope.checknone = function () {
            for (i = 0; i < $scope.adlist.length; i++) {
                ($scope.adlist)[i].checked = false;
            }
            //$scope.adridarrcopy = [];
            $scope.adridarrcopy.splice(0, $scope.adridarrcopy.length);
            // console.log($scope.adridarrcopy);
        };

    })

    .service('province', function () {
        return prov = ["北京市（京）", "天津市（津）", "上海市（沪）", "重庆市（渝）", "河北省（冀）", "河南省（豫）", "云南省（云）", "辽宁省（辽）", "黑龙江省（黑）", "湖南省（湘）", "安徽省（皖）", "山东省（鲁）", "新疆维吾尔（新）", "江苏省（苏）", "浙江省（浙）", "江西省（赣）", "湖北省（鄂）", "广西壮族（桂）", "甘肃省（甘）", "山西省（晋）", "内蒙古（蒙）", "陕西省（陕）", "吉林省（吉）", "福建省（闽）", "贵州省（贵）", "广东省（粤）", "青海省（青）", "西藏（藏）", "四川省（川）", "宁夏回族（宁）", "海南省（琼）", "台湾省（台）", "香港特别行政区", "澳门特别行政区"];
    })

    //moreController
    .controller('moreController', function ($scope, $rootScope, $http, $location) {
        $scope.drlist = $rootScope.a;
        $scope.showlist = function () {
            $location.path('/app/showlist');
        };
        $scope.ask = function () {
            $location.path('/app/msgde');
        };

    })

    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, ngModel) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                element.bind('change', function (event) {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                    //附件预览
                    scope.file = (event.srcElement || event.target).files[0];
                    scope.getFile(scope.file);
                });
            }
        };
    }])

    .directive('onFinishRenderFilters', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        };
    })

    .factory('fileReader', ["$q", "$log", function ($q, $log) {
        var onLoad = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.resolve(reader.result);
                });
            };
        };

        var onError = function (reader, deferred, scope) {
            return function () {
                scope.$apply(function () {
                    deferred.reject(reader.result);
                });
            };
        };

        var getReader = function (deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            return reader;
        };

        var readAsDataURL = function (file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };

        return {
            readAsDataUrl: readAsDataURL
        };
    }])

    .factory('locals', ['$window', function ($window) {
        return { //存储单个属性
            set: function (key, value) {
                $window.localStorage[key] = value;
            }, //读取单个属性
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            }, //存储对象，以JSON格式存储

            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            }, //读取对象
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '[]');
            },
            getObjecta: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            },
            del: function (key) {
                $window.localStorage.removeItem[key];
            },
            delall: function () {
                $window.localStorage.clear();
            }

        }
    }])
    /*新增 LMJ begin*/
    .controller('folUpNoticeController', function ($scope, $rootScope, $http, $location) {
        $scope.formData = {}; //checkBox的model集合
        $scope.checkBoxVal = []; //保存用户选择的checkBox
        //获取某工作室的上一次的选择记录
        var userId = $rootScope.loginUserId;
        $http({
            method: 'post',
            data: {
                userId: userId
            },
            url: 'http://localhost/medicalsys/studio/notice/getStudioNoticeList'
        }).success(function (data) {
            // console.log(data);
            $rootScope.allCheckHistory = data.roots;
        }).error(function (data) {
            ZENG.msgbox.show(data.errorMessage, 5, 1500);
            $location.path("/app/main");
        });

        //获取医生工作室
        $http({
            method: 'get',
            url: 'http://localhost/medicalsys/doctors/doctorInfo/getStudioByDoctorId?userId=' + $rootScope.loginUserId
        }).success(function (data) {
            // console.log(data);
            if (data) {
                dotSelectList = [];
                for (var i = 0; i < data.roots.length; i++) {
                    $rootScope.firstPb = data.roots[0].id;
                    $rootScope.pbName = data.roots[0].name;
                    dotSelectList.push(data.roots[i]);
                }
                $rootScope.dotSelectList = dotSelectList;
                $rootScope.tableChoose = "";
            } else {
                ZENG.msgbox.show("获取数据失败", 1, 1500);
            }
        }).error(function (data) {
            // console.info(data);
            alert("系统出错");
        });

        $scope.initInpDatas = function () { //清空所有的选择
            angular.forEach(($scope.formData),function (value,key) {
                ($scope.formData)[key] = false;
            });
        }

        $scope.CdotRoom = function (x) {
            $scope.initInpDatas();
            if ($rootScope.allCheckHistory == undefined) {
                $rootScope.allCheckHistory = [];
            }
            var allDatas = $rootScope.allCheckHistory;
            var tempDatas = new Array();
            $rootScope.xsCRId = x; //工作室ID
            // console.log($rootScope.xsCRId);
            for (var i = 0; i < allDatas.length; i++) {
                if (allDatas[i].studioId == $rootScope.xsCRId) {
                    tempDatas.push(allDatas[i]);
                }
            }
            if (tempDatas != null || tempDatas != undefined) {
                //将选择的选项反映到页面中，类型（0(d)：天，1(w)：周，2(m)：月；后一位代表数值）
                for (var i = 0; i < tempDatas.length; i++) {
                    switch (tempDatas[i].type) {
                        case '0':
                            switch (tempDatas[i].digital) {
                                case '1':
                                    $scope.formData.d1 = true;
                                    break;
                                case '2':
                                    $scope.formData.d2 = true;
                                    break;
                                case '3':
                                    $scope.formData.d3 = true;
                                    break;
                                case '5':
                                    $scope.formData.d5 = true;
                                    break;
                            }
                            ;
                            break;
                        case '1':
                            switch (tempDatas[i].digital) {
                                case '1':
                                    $scope.formData.w1 = true;
                                    break;
                                case '2':
                                    $scope.formData.w2 = true;
                                    break;
                                case '3':
                                    $scope.formData.w3 = true;
                                    break;
                            }
                            ;
                            break;
                        case '2':
                            switch (tempDatas[i].digital) {
                                case '1':
                                    $scope.formData.m1 = true;
                                    break;
                                case '2':
                                    $scope.formData.m2 = true;
                                    break;
                                case '3':
                                    $scope.formData.m3 = true;
                                    break;
                                case '6':
                                    $scope.formData.m6 = true;
                                    break;
                                case '12':
                                    $scope.formData.m12 = true;
                                    break;
                            }
                            ;
                            break;
                    }
                }
            }
        }

        $scope.submitNotice = function () {
            var selectDatas = [];
            //遍历$scope.formData对象，取出选择的选项
            if ($scope.formData != {}) {
                angular.forEach($scope.formData, function (value, key) {
                    if (value == true) {
                        selectDatas.push(key);
                    }
                });
            }
            if ($scope.falXSName == "" || $scope.falXSName == undefined) {
                ZENG.msgbox.show("请选择工作室", 1, 1500);
                return;
            }

            if (selectDatas.length == 0) {
                ZENG.msgbox.show("请至少选择一项", 1, 1500);
                return;
            }
            var chooseArr = [];
            var chooseJson = {};
            for (var i = 0; i < selectDatas.length; i++) {
                chooseJson = {};//每次只提交一条数据给数组，所以每次要置空。
                chooseJson['studioId'] = $rootScope.xsCRId; //工作室ID
                chooseJson['digital'] = selectDatas[i].substr(1, (selectDatas[i].length - 1)); //因子（多选框的数值）
                var type = selectDatas[i].substr(0, 1); //类型（0(d)：天，1(w)：周，2(m)：月）
                switch (type) {
                    case 'd':
                        chooseJson['type'] = 0;
                        break;
                    case 'w':
                        chooseJson['type'] = 1;
                        break;
                    case 'm':
                        chooseJson['type'] = 2;
                        break;
                }
                chooseJson['userId'] = $rootScope.loginUserId; //用户ID
                chooseArr.push(chooseJson);
                var arrayJson = {};
                arrayJson['studioNoticeList'] = chooseArr;
                arrayJson['studioId'] = $rootScope.xsCRId;
                var datas = JSON.stringify(arrayJson);
            }
            // console.log(datas);
            $http({
                method: 'post',
                data: datas,
                url: "http://localhost/medicalsys/studio/notice/saveOrUpdate"
            }).success(function (ret) {
                if (ret.success) {
                    ZENG.msgbox.show("提交成功", 4, 1500);
                    // $http({
                    //     method: 'post',
                    //     data:{userId:userId},
                    //     url: 'http://localhost/medicalsys/studio/notice/getStudioNoticeList'
                    // }).success(function (data) {
                    //     console.log(data);
                    //     $rootScope.allCheckHistory = data.roots;
                    // }).error(function () {
                    //     alert("出现错误");
                    //     $location.path("/app/main");
                    // });
                    // $location.path("/app/main");
                }
            }).error(function () {
                alert("提交失败，请稍后重试！");
            })
        }
    })
    .directive('select', function () {
        return {
            restrict: 'E',
            scope: false,
            link: function (scope, ele) {
                ele.on('touchmove touchstart', function (e) {
                    e.stopPropagation();
                })
            }
        }
    })
    .directive('setFocus', function () {
        return {
            scope: false,
            link: function (scope, element) {
                scope.$watch("isFocus", function (newValue, oldValue, scope) {
                    element[0].focus(); //获取焦点
                }, true);
            }
        };
    })
    /* end LMJ*/
    .factory('datetosrc',function(){
        return{
            tosrc:function(strTime){
                var date = new Date(strTime);
                return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
            }
        }
    })
    .factory('getage',function(){
        return{
            Age:function(strBirthday){
                var returnAge;
                if(typeof(strBirthday)=='string'){
                    var strBirthdayArr=strBirthday.split("-");
                    var birthYear = strBirthdayArr[0];
                    var birthMonth = strBirthdayArr[1];
                    var birthDay = strBirthdayArr[2];
                }else if(typeof(strBirthday)=='number'){
                    var birthYear = new Date(strBirthday).getFullYear();
                    var birthMonth = new Date(strBirthday).getMonth()+1;
                    var birthDay = new Date(strBirthday).getDate();
                }
                d = new Date();
                var nowYear = d.getFullYear();
                var nowMonth = d.getMonth() + 1;
                var nowDay = d.getDate();

                if(nowYear == birthYear){
                    returnAge = 0;//同年 则为0岁
                }else{
                    var ageDiff = nowYear - birthYear ; //年之差
                    if(ageDiff > 0){
                        if(nowMonth == birthMonth) {
                            var dayDiff = nowDay - birthDay;//日之差
                            if(dayDiff < 0){
                                returnAge = ageDiff - 1;
                            }else{
                                returnAge = ageDiff ;
                            }
                        }
                        else{
                            var monthDiff = nowMonth - birthMonth;//月之差
                            if(monthDiff < 0){
                                returnAge = ageDiff - 1;
                            }else{
                                returnAge = ageDiff ;
                            }
                        }
                    }else{
                        returnAge = -1;//返回-1 表示出生日期输入错误 晚于今天
                    }
                }

                return returnAge;//返回周岁年龄

            }
        }
    })
    .controller('kaifan',function($rootScope,$scope,$http,$ionicPopup,fileReader,locals,$location,getage,loadingService){
        $scope.thumb = {};      //用于存放图片的base64
        $scope.reader = new FileReader();   //创建一个FileReader接口
        $scope.add=true;
        $rootScope.Cyy=1;
        $scope.pic={};
        if(locals.getObject('form')==''||locals.getObject('form')==undefined){
            $scope.form = {     //用于绑定提交内容，图片或其他数据
                picUrl:'',
                sex:'男',
                money:$rootScope.fuzhen
            };
        }else{
            $scope.form=$scope.bin=locals.getObject('form');
            $scope.form.age=new Date(locals.getObject('form').age||locals.getObject('form').birthday);
        }
        // if(locals.getObject('chosebinren')){
        //     $scope.bin=locals.getObject('chosebinren')
        // }
        $scope.addmoney=function(n){
            if($scope.form.money<=1&&n==-1)return;
            $scope.form.money=(($scope.form.money*1000+n*1000)/1000).toFixed(2);
        }
        //获取用户的病人列表
        $http({
            method:'post',
            url:'http://localhost/medicalsys/doctors/patientInfo/getPatientByUser?userId='+$rootScope.uid
        }).success(function(data){
            $scope.bingren=data.roots;
        });
        $scope.addbin=function(){
            //为用户添加病人
            $scope.newbin={
                name:$scope.form.name,
                userId:$rootScope.uid,
                //accountId:$rootScope.userName,
                phone:$rootScope.userName,
                sex:$scope.form.sex,
                birthday:$('input[name=age]').val()//new Date($scope.form.age).getDate()
            }
            $http({
                method:'post',
                url:'http://localhost/medicalsys/doctors/patientInfo/saveOrUpdate',
                data:$.param($scope.newbin),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(data){
                $http({
                    method:'post',
                    url:'http://localhost/medicalsys/doctors/patientInfo/getPatientByUser?userId='+$rootScope.uid
                }).success(function(data){
                    $scope.bingren=data.roots;
                    for(var i in $scope.bingren){
                        if($scope.bingren[i].name==$scope.form.name){
                            $rootScope.hisId=$scope.bingren[i].hisId;
                            $rootScope.times = $scope.bingren[i].times || 1;
                            $rootScope.sickId=$scope.bingren[i].id;

                            $rootScope.orderida = $scope.bingren[i].id;
                            $rootScope.falSickName = $scope.bingren[i].name;
                            $rootScope.falSickSex = $scope.bingren[i].sex;
                            $rootScope.falSickAge = getage.Age($scope.bingren[i].birthday);
                            $rootScope.falSickPid = $scope.bingren[i].hisId;
                            $location.path('/app/nSugUse');
                        }
                    }
                });
            });
        }
        $scope.checkbingren=function(){
            if($scope.bin==null){
                $scope.form.name='';
                $scope.form.sex='';
                $scope.form.age='';
                return;
            }
            $scope.form.name=$scope.bin.name;
            $scope.form.sex=$scope.bin.sex;
            $scope.form.age=new Date($scope.bin.birthday);
            $rootScope.sickId=$scope.bin.id;
            $rootScope.hisId=$scope.bin.hisId;
            $rootScope.orderida = $scope.bin.id;
            $rootScope.falSickName = $scope.bin.name;
            $rootScope.falSickSex = $scope.bin.sex;
            $rootScope.falSickAge = getage.Age($scope.bin.birthday);
            $rootScope.falSickPid = $scope.bin.hisId;
            locals.setObject('chosebinren',$scope.bin);
        }
        $scope.lookJL=function(){
            $rootScope.cOrderMess = $scope.bin;
            $rootScope.cOrderMess.binrName = $scope.bin.name;
            $rootScope.cOrderMess.binrSex = $scope.bin.sex;
            $rootScope.cOrderMess.binrAge = getage.Age($scope.bin.birthday);
            $location.url('/app/seeMedicalRecords?pid='+$scope.bin.id);
        }
        $scope.change=function(){
            $scope.bin='';
        }

        $scope.gokaifan=function(){//直接开方
            if($scope.form.name==''||$scope.form.name==undefined){
                ZENG.msgbox.show("请选择或输入名字", 1, 1500);
                return;
            }else if($scope.form.sex==''||$scope.form.sex==undefined){
                ZENG.msgbox.show("请选择性别", 1, 1500);
                return;
            }else if($scope.form.age==''||$scope.form.age==undefined){
                ZENG.msgbox.show("请选择出生日期", 1, 1500);
                return;
            // }else if($scope.form.money==''||$scope.form.money==undefined){
            //     ZENG.msgbox.show("请出入诊疗费", 1, 1500);
            //     return;
            }
            $rootScope.pname=$scope.form.name;
            for(var i in $scope.bingren){
                if($scope.bingren[i].name==$scope.form.name){
                    $rootScope.sickId=$scope.bingren[i].id;
                    $rootScope.hisId=$scope.bingren[i].hisId;
                    $scope.ne=false;
                    break;
                }else{
                    $scope.ne=true;
                }
            }
            $rootScope.kf='快捷';
            $rootScope.lishicf=1;
            if($scope.ne){
                $scope.addbin();
            }else{
                $http({
                    method:'get',
                    url:'http://localhost/medicalsys/mzsys/getPrescriptionList?flag=2&pid='+$rootScope.sickId
                }).success(function(data){
                    //console.log(JSON.parse(data.list0.preList));
                    if(data.list0.preList){
                        $rootScope.times=JSON.parse(data.list0.preList)[0].times;
                    }else{
                        $rootScope.times=1;
                    }
                    $location.path('/app/nSugUse');
                });
            }
            form=$scope.form;
            form.age=new Date($scope.form.age).getTime();
            locals.setObject('form',form);
            // console.log(locals.getObject('form'));

        }
        $scope.gocma=function(){
            //$scope.thumb=locals.get('thumb');
            if($scope.form.name==''||$scope.form.name==undefined){
                ZENG.msgbox.show("请选择或输入名字", 1, 1500);
                return;
            }else if($scope.form.sex==''||$scope.form.sex==undefined){
                ZENG.msgbox.show("请选择性别", 1, 1500);
                return;
            }else if($scope.form.age==''||$scope.form.age==undefined){
                ZENG.msgbox.show("请选择出生日期", 1, 1500);
                return;
            }
            // else if($scope.form.money==''||$scope.form.money==undefined){
            //     ZENG.msgbox.show("请出入诊疗费", 1, 1500);
            //     return;
            // }
            $rootScope.myPopup = $ionicPopup.show({
                templateUrl: "templates/cma.html",
                title: '请选择照片',
                subTitle: '',
                scope: $scope,
                buttons: [
                    {
                        text:'取消'
                    },
                    {
                        text: '提交',
                        type: 'button-medic',
                        onTap: function (e) {
                            //locals.set('thumb',$scope.thumb);

                            for(var i in $scope.bingren){
                                if($scope.bingren[i].name==$scope.form.name){
                                    $rootScope.bid=$scope.bingren[i].id;
                                    $scope.ne1=false;
                                    break;
                                }else{
                                    $scope.ne1=true;
                                }
                            }
                            if($scope.ne1)$scope.addbin();
                            // console.log($scope.thumb);
                            $scope.submit_form();
                        }
                    },]
            });
        }
        $scope.thumbnum=function(){
            var n=0;
            for(var i in $scope.thumb){
                n++;
            }
            if(n<9){
                $scope.add=true;
            }else{
                $scope.add=false;
            }
        }
        $scope.getFile = function (v) {
            fileReader.readAsDataUrl(v, $scope).then(function (result) {
                $scope.imageSrc = result;
            });
        };
        $scope.img_upload = function(files) {       //单次提交图片的函数
            loadingService.showLoading();
            $scope.guid = (new Date(dateService.getServerDate())).valueOf();   //通过时间戳创建一个随机数，作为键名使用
            $scope.reader.onload = function(ev) {
                $scope.$apply(function(){
                    $scope.thumb[$scope.guid] = {
                        imgSrc : ev.target.result,  //接收base64
                    }
                });
                $scope.$watch($scope.thumb[$scope.guid],$scope.thumbnum);
            };
            $scope.reader.readAsDataURL(files[0]);  //FileReader的方法，把图片转成base64
            var data = new FormData();      //以下为像后台提交图片数据
            data.append('file', files[0]);
            data.append('guid',$scope.guid);
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/online/presgoods/upLoadPresPic', //向url发送图片
                data:data,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity
            }).success(function(data) {
                $scope.pic[$scope.guid] = data;
                loadingService.hideLoading();
            })
        };

        $scope.img_del = function(key,$event) {    //删除，删除的时候thumb和form里面的图片数据都要删除，避免提交不必要的
            $event.stopPropagation();
            var guidArr = [];
            for(var p in $scope.thumb){
                guidArr.push(p);
            }
            delete $scope.thumb[guidArr[key]];
            delete $scope.pic[guidArr[key]];
            $scope.$watch($scope.thumb[$scope.guid],$scope.thumbnum);
        };
        $scope.submit_form = function(){    //图片选择完毕后的提交，这个提交并没有提交前面的图片数据，只是提交用户操作完毕后，到底要上传哪些，通过提交键名或者链接，后台来判断最终用户的选择,整个思路也是如此
            $scope.form.picUrl='';
            $scope.form.phone=$rootScope.userName;
            for(var i in $scope.pic){
                $scope.form.picUrl=$scope.form.picUrl+$scope.pic[i]+';';
            }
            $scope.form.picUrl=$scope.form.picUrl.substring(0,$scope.form.picUrl.length-1);
            if($scope.form.picUrl==''){
                ZENG.msgbox.show('请选择图片', 5, 1500);
                return;
            }
            $scope.form.type=1;
            //$scope.form.area=$rootScope.area;
            //console.log($scope.form);
            $scope.form.picName=$scope.form.name+'_处方图片_'+new Date(dateService.getServerDate()).getTime();
            $scope.form.patientId=$rootScope.sickId;//病人id
            $scope.form.studioId=$rootScope.studioId;//工作室id
            $scope.form.distributeType=1;//
            $http({
                method: 'post',
                url: 'http://localhost/medicalsys/online/presgoods/savePresPicData',//提交其他信息
                data:$scope.form,
            }).success(function(data){
                console.log(data);
                $location.path('/app/main');
                locals.setObject('form','');
                locals.setObject('chosebinren','');
                ZENG.msgbox.show('保存成功，开方完成!', 4, 1500);
            }).error(function(data){
                console.log(data);
                ZENG.msgbox.show(data.errorMessage, 5, 1500);
            })
        };
    })
