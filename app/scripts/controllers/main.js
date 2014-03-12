'use strict';

angular.module('fiveStarApp')
.controller('MainCtrl', function ($scope, $routeParams) {

    $scope.state = {
        query: $routeParams.query,
        index: $routeParams.index,
        node: $routeParams.node,
        brand: $routeParams.brand
    };
    $scope.previousStates = [$scope.state];

    $scope.$watch('state', function() {
        // update URL on state change and save to previousStates

        // error check
        if ($scope.state.query === undefined || $scope.state.index === undefined) {
            return;
        }
        if ($scope.state.query.length === 0) {
            return;
        }

        // should clear if index is different
        // -> clears node and brand values if index changes cause they're likely to screw things up
        var indexChanged = ($scope.state.index !== $scope.previousStates[$scope.previousStates.length].index);
        // should push if node or brand is different
        // -> only push to history if they change AND we care about their values
        var newState = ((!indexChanged) && (($scope.state.node !== $scope.previousStates[$scope.previousStates.length].node) ||
                         ($scope.state.brand !== $scope.previousStates[$scope.previousStates.length].brand)));

        if (indexChanged) {
            $scope.state.node = undefined;
            $scope.state.brand = undefined;
            // reset previousStates
            $scope.previousStates = [$scope.state];
        }

        if (newState) {
            $scope.previousStates.push($scope.state);
        }

    }, true);

});
