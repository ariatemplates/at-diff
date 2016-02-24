/*
 * Copyright 2016 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const bootstrap = `<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous"/>
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap-theme.min.css" rel="stylesheet" integrity="sha384-fLW2N01lMqjakBkx3l/M9EahuwpSfeNvV63J5ezn3uZzapT0u7EYsXMjQV+0En5r" crossorigin="anonymous"/>`;

exports.development = `${bootstrap}
<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.0/es6-shim.js" integrity="sha384-ZOXK1qK/TRkxNtrc6MDT43fLPwzTqd7NzNwnHBBpGrPA1t4r0DBCzZxDzi+sOQWn" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/angular2@2.0.0-beta.15/es6/dev/src/testing/shims_for_IE.js" integrity="sha384-vmpnqWheESIwTJ5g6/h98gjmZDUTR4yRXPSokA3So0t7ELKvDfneF50xolj0cOt4" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/angular2-polyfills.js" integrity="sha384-womumltbXE65vY3FaWijDBDByun7RlfDkywqHrSVIgKt5BRAD34UYJogLB5OF16w" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/Rx.umd.js" integrity="sha384-uYhBu4fTPlRKwNgB1vf2tfbVis5Pl5u9dV5jWFBrpSOwuZsHF5c5jRWteEO+Kn1R" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/angular2-all.umd.dev.js" integrity="sha384-J7Yjw8eHXEcexLYM+9w2k33EkbAamJu/MGBPlDefbT4cgFybF3tfouaLmPWGOKGX" crossorigin="anonymous"></script>`;

exports.production = `${bootstrap}
<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.0/es6-shim.min.js" integrity="sha384-5rFfI8Bv0xUqQgPzEabT0rcq6p7zCwIsTq8TaZutij5wosFPHELq6Lhu43d/RKL2" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/angular2@2.0.0-beta.15/es6/dev/src/testing/shims_for_IE.js" integrity="sha384-vmpnqWheESIwTJ5g6/h98gjmZDUTR4yRXPSokA3So0t7ELKvDfneF50xolj0cOt4" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/angular2-polyfills.min.js" integrity="sha384-9lbPGrfZKTTK5Arklaz9unYNcuRj3oCWQnWPEdPNH20tjCrkgqtj8CNzORPaGWBS" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/Rx.umd.min.js" integrity="sha384-m+kjDcoATT1Hwlw02icCucgGZnwUn3sA5LSVR1oH0z0XLDiwLMSR0FEpdQ3WSdU8" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/angular2-all.umd.dev.js" integrity="sha384-J7Yjw8eHXEcexLYM+9w2k33EkbAamJu/MGBPlDefbT4cgFybF3tfouaLmPWGOKGX" crossorigin="anonymous"></script>`;

// Note that the following script does not work:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/angular.js/2.0.0-beta.15/angular2-all.umd.min.js" integrity="sha384-scNBZgI8GM00LzW05wulFuiKes6F9T6UlJFNKk7WrRZu13tQnyIXeMVgOKTBOve+" crossorigin="anonymous"></script>
