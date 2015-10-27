(function (angular) {
    'use strict';

    angular.module('jasmineErrorExplainer', [
        'ngSanitize'
    ])
        .controller('Main', function ($scope) {

            var CALLED_WITH = /^Expected spy (?:.+) to have been called with (.+), but actual calls were (.+)\.$/,
                EQUAL = /^Expected (.+) to equal (.+)\.$/,
                BE = /^Expected (.+) to be (.+)\.$/;

            function extractValues(error) {
                var matches;

                matches = CALLED_WITH.exec(error);
                if (matches) {
                    return {
                        actual: matches[2],
                        expected: matches[1]
                    };
                }

                matches = EQUAL.exec(error);
                if (matches) {
                    return {
                        actual: matches[1],
                        expected: matches[2]
                    }
                }

                matches = BE.exec(error);
                if (matches) {
                    return {
                        actual: matches[1],
                        expected: matches[2]
                    }
                }
            }

            function highlightFirstMismatch(expected, actual) {
                var i;
                for (i = 0; i < actual.length; i ++) {
                    if (i < expected.length) {
                        if (actual[i] !== expected[i]) {
                            $scope.message = 'Actual value differs from character ' + i + ' onwards.';
                            $scope.actual = markIncorrectFromIndex(actual, i);
                            $scope.expected = markCorrectFromIndex(expected, i);
                            break;
                        }
                    } else {
                        $scope.actual = actual;
                        $scope.expected = expected;
                        $scope.message = 'Actual value does not match expected value at all.';
                        break;
                    }
                }
            }

            function highlightStringInString(string, inString) {
                return wrapInSpan(inString, inString.indexOf(string), inString.indexOf(string) + string.length, 'highlight');
            }

            function markCorrectFromIndex(string, index) {
                return wrapInSpan(string, index, string.length, 'correct');
            }

            function markIncorrectFromIndex(string, index) {
                return wrapInSpan(string, index, string.length, 'incorrect');
            }

            function wrapInSpan(string, startIndex, endIndex, spanClass) {
                var before = string.substring(0, startIndex),
                    between = string.substring(startIndex, endIndex),
                    after = string.substring(endIndex);
                return before + '<span class="'+ spanClass + '">' + between + '</span>' + after;
            }

            $scope.explain = function () {
                var values;
                $scope.actual = undefined;
                $scope.expect = undefined;
                values = extractValues($scope.input);
                if (!values) {
                    $scope.message = 'Failed to identify error. Please make sure you\'ve copied the whole message.';
                } else {
                    if (values.actual.indexOf(values.expected) > -1) {
                        $scope.actual = highlightStringInString(values.expected, values.actual);
                        $scope.expected = values.expected;
                        $scope.message = 'Actual value contains expected value, but is longer.';
                    } else if (values.expected.indexOf(values.actual) > -1) {
                        $scope.expected = highlightStringInString(values.actual, values.expected);
                        $scope.actual = values.actual;
                        $scope.message = 'Expected value contains actual value, but is longer.';
                    } else {
                        highlightFirstMismatch(values.expected, values.actual);
                    }
                }
            };

        })

}(angular));
