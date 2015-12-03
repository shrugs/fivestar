'use strict';

angular.module('fiveStarApp')
.controller('MainCtrl', function ($scope, $routeParams, $location, debounce, ngProgress, $http, $q, $rootScope, $timeout) {

    $scope.syncFromURL = function() {
        $scope.state = {
            query: $routeParams.query || '',
            index: $routeParams.index || 'All',
            node: parseInt($routeParams.node, 10) || undefined,
            brand: $routeParams.brand,
            onlyAmazon: $routeParams.onlyAmazon
        };
    };

    $scope.syncFromURL();
    $scope.previousStates = [angular.copy($scope.state)];
    $scope.unsubRouteChange = function(){};

    $scope.firstRun = true;
    $scope.loading = false;
    $scope.showDelay = false;
    $scope.noResults = false;

    ngProgress.color('#4FC1E9');
    $scope.canceler = $q.defer();

    $scope.handleState = debounce(1200, function() {
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
        var indexChanged = ($scope.state.index !== $scope.previousStates[$scope.previousStates.length-1].index);
        // should push if node or brand is different
        // -> only push to history if they change AND we care about their values
        var newState = ((!indexChanged) && (($scope.state.node !== $scope.previousStates[$scope.previousStates.length-1].node) ||
                         ($scope.state.brand !== $scope.previousStates[$scope.previousStates.length-1].brand)));

        if (indexChanged) {
            $scope.state.node = undefined;
            $scope.state.brand = undefined;
            // reset previousStates
            $scope.previousStates = [angular.copy($scope.state)];
        }

        if (newState) {
            $scope.previousStates.push(angular.copy($scope.state));
        }

        // unsub
        $scope.unsubRouteChange();

        // now sync the state to the url
        angular.forEach($scope.state, function(v, k) {
            $location.search(k, v);
        });
        // resubscribe to urlChange
        $scope.unsubRouteChange = $rootScope.$on('$locationChangeSuccess', $scope.syncFromURL);

        // swag, now call getData
        $scope.getData();

    });

    $scope.$watch('state', $scope.handleState, true);


    $scope.getData = function() {

        ga('send', 'event', 'search', 'click', $scope.state);

        // reset all of our booleans
        $scope.firstRun = false;
        $scope.noResults = false;
        $scope.showDelay = false;
        $scope.error = undefined;
        $scope.canceler.resolve();
        ngProgress.reset();
        $scope.canceler = $q.defer();
        $scope.loading = true;
        $scope.results = undefined;

        // start ngProgress bar
        ngProgress.start();

        // pass the state to the backend to get the data
        $http.get('/api/search', {
            params: $scope.state,
            timeout: $scope.canceler.promise
        }).success(function(data) {
            $scope.showDelay = false;
            $scope.results = data;
            ngProgress.complete();
            $scope.loading = false;
            var unbindWatching = $scope.$watch('results.results', function() {
                if ($scope.results.results.length > 0) {
                    angular.forEach($scope.results.results, function(r) {
                        angular.forEach(r.items, function(item) {
                            item.DetailPageURL = decodeURIComponent(item.DetailPageURL);
                        });
                    });
                    unbindWatching();
                }
            });

            // determine if there are no results
            $scope.noResults = true;
            for (var i = 0; i < $scope.results.results.length; i++) {
                if ($scope.results.results[i].items.length !== 0) {
                    // is good to go,
                    $scope.noResults = false;
                    break;
                }
            }

        }).error(function() {
            // Shit hapens, I guess

            // only show error if we are not trying another request (we try another request on state change)
            if (!$scope.loading) {
                $scope.error = 'Whoops, looks like the server got too tired. Give it a second and try again!';
            }
            ngProgress.reset();
        });

        // add show Delay timeout
        $timeout(function() {
            $scope.showDelay = true;
        }, 4000);

    };


    $scope.selectBin = function(bin) {
        if (bin.Name === 'Brand') {
            $scope.state.brand = bin.Value;
        } else if (bin.Name === 'BrowseNode') {
            $scope.state.node = bin.Value;
        } else if (bin.Name === 'SearchIndex') {
            $scope.state.index = bin.Value;
        }
    };

    // returns true if that part of the state is defined
    $scope.isBin = function(bin) {
        if (bin === 'BrandName') {
            return $scope.state.brand !== undefined;
        } else if (['Categories', 'Subject'].indexOf(bin) !== -1) {
            return $scope.state.node !== undefined;
        }
    };

    // clears variable and therefore reloads page and data
    $scope.clearBin = function(bin) {
        if (bin === 'BrandName') {
            $scope.state.brand = undefined;
        } else if (['Categories', 'Subject'].indexOf(bin) !== -1) {
            $scope.state.node = undefined;
        }
    };

    $scope.arrayIfNot = function(obj) {
        if (typeof obj === 'undefined') {
            return [];
        }

        if (!(obj instanceof Array)) {
            return [obj];
        }
        return obj;
    };

    $scope.toggleOnlyAmazon = function() {
        $scope.state.onlyAmazon = !$scope.state.onlyAmazon;
    };

    $scope.recordAmazonClickthrough = function() {
      if (ga) {
        ga('send', 'event', 'amazon', 'clickthrough');
      }
    }

});
