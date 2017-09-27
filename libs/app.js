// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ctrls.controllers'])

    .run(function ($ionicPlatform, $rootScope, $timeout, $location, $ionicPopup, $http, locals, docService) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
            // window.onbeforeunload = function () {
            //     console.log("onbeforeunload事件监听，关闭Scoket！");
            //     closeScoket();
            // }
        });

        $rootScope.authStatus = false;
        //stateChange event
        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
            if ($rootScope.myWs && toState.name!="app.mymsgde") {
                $http({
                    method: 'GET',
                    url: 'http://localhost/medicalsys/webscoket/chat/offLine?userId=' + $rootScope.aa + '&studioId=' + $rootScope.a.toUserId,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data.success) {
                        $rootScope.myWs.close();
                        $rootScope.myWs = '';
                    }else{
                        ZENG.msgbox.show(data.errorMessage,1,1500);
                    }
                }).error(function () {
                    ZENG.msgbox.show('下线失败！',1,1500);
                });
            }

            if ($rootScope.myPopup) {
                $rootScope.myPopup.close();
            }
            isloged = locals.get("doclocallogged", "");
            $rootScope.isloged = locals.get("doclocallogged");
            if (docService.isLogged == false) {
                if (toState.url != "/signup" && toState.url != "/forget") {
                    if ($rootScope.isloged == 'true') {
                        // console.log("以保存但尚未登陆");
                        doclcn = locals.get("doclocalusername", "");
                        doclcw = locals.get("doclocalpassword", "");
                        // console.log(doclcn + doclcw);
                        $rootScope.doclcformData = {
                            username: doclcn,
                            password: doclcw,
                            userType: 1
                        };
                        $http({
                            method: 'POST',
                            url: 'http://localhost/medicalsys/login',
                            data: $.param($rootScope.doclcformData),

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
                                docService.isLogged = true;
                                if (data.data.imgUrl == undefined) {
                                    $rootScope.avatarurl = "images/myPhone.png";
                                } else {
                                    $rootScope.avatarurl = data.data.imgUrl;
                                }
                                $rootScope.aa = $rootScope.doclcformData.username;
                                $rootScope.loginUserId = data.data.id;
                                locals.set("doclocaluserid", data.data.id);

                            } else {
                                alert(data.errorMessage);
                                $location.path("/app/login");
                            }
                        }).error(function () {
                            $location.path("/app/login");
                        });
                    } else {
                        $location.path("/app/login");
                    }
                }
            }
        });
        $rootScope.loginalert = function () {
            $rootScope.lgbox = {
                username: '',
                password: '',
                userType: 1
            };
            var loginbox = $ionicPopup.show({
                templateUrl: 'templates/loginbox.html',
                title: '请输入您的信息',
                subTitle: '',
                scope: $rootScope,
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
            }).then(function (res) {
                if (res == 1) {
                    // console.info($rootScope.lgbox);
                    // console.log($rootScope.lgbox.username);
                    $http({
                        method: 'POST',
                        url: 'http://localhost/medicalsys/login',
                        data: $.param($rootScope.lgbox),

                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Access-Control-Allow-Origin': '*'
                        }

                    }).success(function (datas) {
                        if (!datas.success) {
                            alert(datas.errorMessage);
                            docService.isLogged = false;
                            locals.set("doclocallogged", false);
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
                            $rootScope.aa = $rootScope.lgbox.username;
                            // console.log(datas);
                            locals.set("doclocalusername", $rootScope.lgbox.username);
                            locals.set("doclocalpassword", $rootScope.lgbox.password);
                            locals.set("doclocaluserid", datas.data.id);
                            docService.isLogged = true;
                            locals.set("doclocallogged", true);
                            $location.path('/app/main');
                            $rootScope.isloged = locals.get("doclocallogged");
                        }
                        // console.info(datas);
                    }).error(function () {
                        $location.path('/app/login');
                        docService.isLogged = false;
                        locals.set("doclocallogged", false);
                    });
                }
                if (res == 2) {
                    $location.path('app/signup');
                }
            });
        };

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            // console.log("URL : "+toState.url);
            if (toState.url == '/dashboard') {
                // console.log("match : "+toState.url);
                $timeout(function () {
                    angular.element(document.querySelector('#leftMenu')).removeClass("hide");
                }, 1000);
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        //解决Android 导航条在顶部的问题
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');
        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('bottom');//默认为left
        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');
        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
        $ionicConfigProvider.scrolling.jsScrolling(true);
        //--------------------------------------
        $stateProvider
            .state('app', {//本来计划的边角隐藏菜单    现在没用了！
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html?v=1.9.6'
            })

            //登录页面
            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html?v=1.9.6',
                        controller: 'formController'
                    }
                },
                authStatus: false
            })

            //登出页面
            .state('app.logout', {
                url: '/logout',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html?v=1.9.6',
                        controller: 'formController'
                    }
                },
                authStatus: false
            })

            //注册页面
            .state('app.signup', {
                url: '/signup',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/register.html?v=1.9.6',
                        controller: 'regController'
                    }
                },
                authStatus: false
            })

            //--------------------------------------
            //主页
            .state('app.main', {
                url: '/main',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/main.html?v=1.9.6',
                        controller: 'mController'
                    }
                },
                cache: false,
            })

            ////////////////////////////自己新加的页面
            //医生信息，基本信息
            .state('app.dotmess', {
                url: '/dotmess',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dotMess.html?v=1.9.6',
                        controller: 'dotMessController'
                    }
                },
            })

            //医生的信息。工作室信息
            .state('app.dotroom', {
                url: '/dotroom',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dotRoom.html?v=1.9.6'
                    }
                },
            })

            //医生工作室地址
            .state('app.dotroomloc', {
                url: '/dotroomloc',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dotRoomLoc.html?v=1.9.6',
                        controller: 'dotRoomLocController'
                    }
                },
                cache: false,
            })

            //医生的排班
            .state('app.dotrange', {
                url: '/dotrange',
                cache: 'false',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dotRange.html?v=1.9.6',
                        controller: 'dotRangeController'
                    }
                },
            })

            //医生聊天窗口
            .state('app.mymsgde', {
                url: '/mymsgde',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chatdetail.html?v=1.9.6',
                        controller: 'skController'
                    }
                },
                cache:false,
            })

            //工作室聊天列表
            .state('app.drlist', {
                url: '/drlist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/drlist.html?v=1.9.6',
                        // controller: 'moController'
                    }
                },
                cache:false,
            })

            //预约病人
            .state('app.dotorder', {
                url: '/dotorder',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dotOrder.html?v=1.9.6',
                        controller: 'dotOrderController'
                    }
                },
                cache:false,
            })

            //患者详情
            .state('app.sickmess', {
                url: '/sickmess',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/sickMessage.html?v=1.9.6',
                        controller: 'sickMessController'
                    }
                },
            })

            //病例+诊断
            .state('app.dotdiag', {
                url: '/dotdiag',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/dotDiagnosis.html?v=1.9.6',
                        controller: 'dotDiagController'
                    }
                },
                cache: false,
            })

            //用药建议
            .state('app.sugUse', {
                url: '/sugUse',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/sugUse.html?v=1.9.6',
                        controller: 'sugUseController'
                    }
                },
                cache: false,
            })

            //诊断和处方预览
            .state('app.showsug', {
                url: '/showsug',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/showSug.html?v=1.9.6',
                        controller: 'showSugController'
                    }
                },
                cache:false,
            })

            .state('app.forget', {
                url: '/forget',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/forget.html?v=1.9.6',
                        controller: 'forgetController'
                    }
                },
            })

            //扫码验证
            .state('app.qrcode', {
                url: '/qrcode',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/QRcode.html?v=1.9.6',
                        controller: 'signController'
                    }
                },
            })

            .state('app.manageadr', {
                url: '/manageadr',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/manageadr.html?v=1.9.6',
                    }
                },
            })
            ////////////////////////////////////////////   user带过来的，现在医生端没有使用
            .state('app.drmore', {
                url: '/drmore',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/drmore.html?v=1.9.6',
                    }
                },
            })

            .state('app.showlist', {
                url: '/showlist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/showlist.html?v=1.9.6',
                    }
                },
            })


            .state('app.pmanage', {
                url: '/pmanage',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/pmanage.html?v=1.9.6',
                        controller:'pmCtrl'
                    }
                },
            })


            .state('app.person', {
                url: '/person',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/person.html?v=1.9.6',
                    }
                },
            })


            .state('app.hismsg', {
                url: '/hismsg',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/hismsg.html?v=1.9.6',
                    }
                },
            })


            .state('app.chatdetail', {
                url: '/chatdetail',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chatdetail.html?v=1.9.6',
                    }
                },
            })

            .state('app.checklist', {
                url: '/checklist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/checklist.html?v=1.9.6',
                    }
                },
                cache:false,
            })

            .state('app.checklistcopy', {
                url: '/checklistcopy',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/checklistcopy.html?v=1.9.6',
                    }
                },
                cache: false,
            })

            .state('app.odwxpay', {
                url: '/odwxpay',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/odwxpay.html?v=1.9.6',
                    }
                },
            })


            .state('app.odrpay', {
                url: '/odrpay',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/odrpay.html?v=1.9.6',
                    }
                },
            })

            .state('app.income', {
                url: '/income',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/income.html?v=1.9.6',
                    }
                },
            })

            .state('app.iclist', {
                url: '/iclist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/incomelist.html?v=1.9.6',
                        controller: 'iclistController'
                    }
                },
            })
            .state('app.cficlist', {
                url: '/cficlist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/chufangInComeList.html?v=1.9.6',
                        controller: 'cficlistController'
                    }
                },
            })

            .state('app.wdlist', {
                url: '/wdlist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdrawlist.html?v=1.9.6',
                    }
                },
            })

            .state('app.bankcard', {
                url: '/bankcard',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/bankcard.html?v=1.9.6',
                    }
                },
            })

            .state('app.withdraw', {
                url: '/withdraw',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/withdraw.html?v=1.9.6',
                    }
                },
            })

            .state('app.choosecard', {
                url: '/choosecard',
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/choosecard.html?v=1.9.6',
                    }
                },
            })

            .state('app.changeavatar', {
                url: '/changeavatar',
                params:{'a':null},
                cache:false,
                views: {
                    'menuContent': {
                        templateUrl: 'templates/changeavatar.html?v=1.9.6',
                        controller: 'upavatarController'
                    }
                },
            })

            /*新增 LMJ begin*/
            .state('app.ifra', {
                url: '/ifra',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/ifra.html?v=1.9.6',
                        // controller: 'physicalTestrResultController'
                    }
                },
                cache: false,
                authStatus: true
            })

            .state('app.followUpNotice', {
                url: '/followUpNotice',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/followUpNotice.html?v=1.9.6',
                    }
                },
                cache:false,
            })
            .state('app.seeMedicalRecords', {
                url: '/seeMedicalRecords',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/seeMedicalRecords.html?v=1.9.6',
                        controller: 'medicalRecodesCtrl'
                    }
                },
            })
            .state('app.jhTest', {
                url: '/jhTest',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/jhTest.html?v=1.9.6',
                        controller: 'jhTestController'
                    }
                },
            })
            .state('app.wxDrlist', {
                url: '/wxDrlist',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/wxDrlist.html?v=1.9.6',
                        controller: 'wxDrlistCtrl'
                    }
                },
                cache:false
            })
            .state('app.sugUse2', {
                url: '/sugUse2',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/sugUse2.html?v=1.9.6',
                        controller: 'sugUse2Ctrl'
                    }
                },
                cache:false,
            })
            .state('app.sugUse3', {
                url: '/sugUse3',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/sugUse3.html?v=1.9.6',
                        controller: 'sugUse3Ctrl'
                    }
                },
                cache:false,
            })
            .state('app.fastPres', {
                url: '/fastPres',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/fastPres.html?v=1.9.6',
                        controller: 'fastPresCtrl'
                    }
                },
            })
            .state('app.pdetail', {
                url: '/pdetail',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/pdetail.html?v=1.9.6',
                        // controller: 'pDetailCtrl'
                        controller: 'sickMessController'
                    }
                },
            })
            .state('app.pdetail2', {
                url: '/pdetail2',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/pdetail2.html?v=1.9.6',
                        controller: 'pDetailCtrl2'
                    }
                },
            })
            .state('app.nSugUse', {
                url: '/nSugUse',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/newSugUse.html?v=1.9.6',
                        controller: 'sugUseController'
                    }
                },
                cache:false,
            })
            .state('app.addrAndChar', {
                url: '/addrAndChar',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/addrAndChar.html?v=1.9.6',
                        controller: 'AACController'
                    }
                },
            })
            .state('app.kaifan', {
                url: '/kaifan',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/kaifan.html?v=1.9.6',
                        //controller: 'kaifan'
                    }
                },
                // cache: false,
            })
        /*end*/
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/main');

    });

