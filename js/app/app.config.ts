declare var angular;
declare var Ps;

angular.module('root', ['ui.bootstrap'])
    .constant('CONFIG',
    {
        DebugMode: true,
        StepCounter: 0,
        //APIHost: 'http://localhost:12017'
    }); 