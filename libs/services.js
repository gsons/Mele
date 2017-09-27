angular.module('starter.services', [])
    .factory('Profiles', function () {
        // Might use a resource here that returns a JSON array
        // Some fake testing data
        var profiles = [{
            id: 0,
            name: 'Anoop Kumar',
            deseg: 'Team Lead',
            face: 'img/150x165/anoop-kumar.png'
        }, {
            id: 1,
            name: 'Vijay Kumar',
            deseg: 'Project Manager',
            face: 'img/150x165/vijay-kumar.png'
        }, {
            id: 2,
            name: 'Durgesh Soni',
            deseg: 'Team Lead',
            face: 'img/150x165/durgesh-soni.png'
        }, {
            id: 3,
            name: 'Manish Mittal',
            deseg: 'Project Manager',
            face: 'img/150x165/manish-mittal.png'
        }, {
            id: 4,
            name: 'Vinay Kumar',
            deseg: 'UI Designer',
            face: 'img/150x165/vinay-kumar.png'
        }, {
            id: 5,
            name: 'Ankit Gera',
            deseg: 'System Administrator',
            face: 'img/150x165/ankit-gera.png'
        }];

        return {
            all: function () {
                return profiles;
            },
            remove: function (id) {
                profiles.splice(profiles.indexOf(id), 1);
            },
            get: function (profileId) {
                for (var i = 0; i < profiles.length; i++) {
                    if (profiles[i].id === parseInt(profileId)) {
                        return profiles[i];
                    }
                }
                return null;
            }
        };
    })

    /*
    * 根据以下参数查找某次病人的处方记录
    * @pid:病人ID,
    * @times:病人就诊次数,
    * @prescriptionSn:处方序号
    * */
    .factory('loadcf',['$http',function ($http) {
        return {
            loadOnceCF:function (pid, times, prescriptionSn) {
                $http({
                    method:'get',
                    url:'http://localhost/medicalsys/mzsys/getPrescriptionDetailList?pid='+pid+'&times='+times+'&accountSn=0&prescriptionSn='+prescriptionSn+'&flag=2&dataType=0'
                }).success(function (data) {
                    // console.log(data);
                    var objcf = data.list;
                    var predetails = JSON.parse(objcf);
                    console.log(predetails);
                    return predetails;
                }).error(function (data) {
                    console.log(data);
                })
            }
        }
    }]);
