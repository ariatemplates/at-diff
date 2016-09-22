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

const bootstrap = `<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" />
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap-theme.min.css" rel="stylesheet" />`;

exports.development = `${bootstrap}
<script src="https://unpkg.com/core-js@2.4.1/client/shim.js" integrity="sha384-uIQcZj6EIUwjiq+fSnpGQDEI3hg/cYFertKIL0Vhby6kZT9FJQzcpa6rYHFQLvb/" crossorigin="anonymous"></script>
<script src="https://unpkg.com/zone.js@0.6.23/dist/zone.js" integrity="sha384-W3bsMWlGoFY4RaQ6+LWC+bdA/xjcmSjkWKqjbPSJEMfu3qNZwXa+d4ToldqUXHuu" crossorigin="anonymous"></script>
<script src="https://unpkg.com/reflect-metadata@0.1.3/Reflect.js" integrity="sha384-FH+k0oZoE9Oi+oLkwlSYKw854fCXw4at5e/uPQX0rHP/6Dp8iVWBlScfDNlqegaA" crossorigin="anonymous"></script>
<script src="https://unpkg.com/rxjs@5.0.0-beta.12/bundles/Rx.js" integrity="sha384-8APZLk0LA7tuPcO11EkPfDN8wsDmkOrehD1e0pslROmV80bskAZB57KJotwFK/eW" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/core@2.0.0/bundles/core.umd.js" integrity="sha384-7GPySWchCEPdlC+/KNHeFVBXiHHhiWGhCLMa3INVaWwyvPsJWY1R630Hx6TQPadf" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/common@2.0.0/bundles/common.umd.js" integrity="sha384-yMJ0U4hxS18O3g3eBfywUxfH4ysVKIMpSXYqzAVCF1A5/vR//BP+Gkhhfn5Y/CES" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/compiler@2.0.0/bundles/compiler.umd.js" integrity="sha384-Lq348fsDDZYK7KPhffeweCQQ/d+I7jQTAroQ/u6KQuXSs2rTXm/60+UeUpkfPZ8E" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/forms@2.0.0/bundles/forms.umd.js" integrity="sha384-Q5DM3b1PWQ9lmOUqREvHxesd2++Zlf7815mA1t7v0rLg0UGtCsIoEa8zHUCW3hzf" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/platform-browser@2.0.0/bundles/platform-browser.umd.js" integrity="sha384-3rh1PfqNOTUMhhjnvfEBuOlDgVF0knJolKx/zDDddLTrdtQCxQv1NK7PWMKwDAas" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/platform-browser-dynamic@2.0.0/bundles/platform-browser-dynamic.umd.js" integrity="sha384-ZDuiOFdLAHqvlkLO4d0rUkYRzT5HDP1t35Q56Dxq3DGe7ZSa7NRx4kni40m7m+ff" crossorigin="anonymous"></script>
`;

exports.production = `${bootstrap}
<script src="https://unpkg.com/core-js@2.4.1/client/shim.min.js" integrity="sha384-H1U1vpHajQaCDagCwGrq5146Ma82N7yUYx0NGTwlETgVm50cReN0n5qifyBRoBoa" crossorigin="anonymous"></script>
<script src="https://unpkg.com/zone.js@0.6.23/dist/zone.min.js" integrity="sha384-+e3R0jY7xQFqiLsp2Gitgob+ViyASnC8HpRP361jeGskH6lRaCdvQl8MNfR1S+Bv" crossorigin="anonymous"></script>
<script src="https://unpkg.com/reflect-metadata@0.1.3/Reflect.js" integrity="sha384-FH+k0oZoE9Oi+oLkwlSYKw854fCXw4at5e/uPQX0rHP/6Dp8iVWBlScfDNlqegaA" crossorigin="anonymous"></script>
<script src="https://unpkg.com/rxjs@5.0.0-beta.12/bundles/Rx.min.js" integrity="sha384-Cig8UTtWnK06ZRcf9ScfhrdxKLuT8lX76waSzTzRePGyn1UfDPkO5pnBPDeyanAa" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/core@2.0.0/bundles/core.umd.min.js" integrity="sha384-Ll7qWQKcjtxPifnn2QSy6Luxx5DovgfMql+LdnZ1ArZWGqgyesxOcivr3OfT/kJ4" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/common@2.0.0/bundles/common.umd.min.js" integrity="sha384-rb5g8C5oQ9fnrASFijEwBMNIfNgKSyb5QAM2a7iaXIwft1aJf6uA9NuJAcTE/x8k" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/compiler@2.0.0/bundles/compiler.umd.min.js" integrity="sha384-gDNhkVuhiCSpf6x93AqrGnNTZUEPi6aw7CK6jQ1wcsCHXT7jWqDh0pZKKrMw/Oxg" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/forms@2.0.0/bundles/forms.umd.min.js" integrity="sha384-ptmYDFb0JhSGetH2KRObsvn+1gEJXtfpHzMYYKBYHMAN8c/r8LT5Pd8arcWs/oML" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/platform-browser@2.0.0/bundles/platform-browser.umd.min.js" integrity="sha384-THVwcCqPixTbEAO0GfBHbgsTDT6F3RrWpINOBaOGHKLY5IKiHRCSK2iLRNRH03Q0" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@angular/platform-browser-dynamic@2.0.0/bundles/platform-browser-dynamic.umd.min.js" integrity="sha384-G+3SEY5td+VvE+J9z+yvYNfsNJT99H7FBQlIS7ADKq7iZfdhjQ0sDTV0NsyRwCER" crossorigin="anonymous"></script>
`;
