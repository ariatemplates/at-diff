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

const bootstrap = `<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
<link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap-theme.min.css" rel="stylesheet" />`;

exports.development = `${bootstrap}
<script src="https://npmcdn.com/core-js@2.4.0/client/shim.js" integrity="sha384-pX7Ahc7H2ApnTuaWaSMT6trarh+bpAs1w7xImCIDSrFQ/6BV/yoZg9+C/27DfUvb" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/zone.js@0.6.12/dist/zone.js" integrity="sha384-RIC6AHYa4rV9qgJMzoee3Fs6zo5C7tV9ddYqlAW+8JB22lWFBq9SQ1gNJGG7yJTY" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/reflect-metadata@0.1.3/Reflect.js" integrity="sha384-FH+k0oZoE9Oi+oLkwlSYKw854fCXw4at5e/uPQX0rHP/6Dp8iVWBlScfDNlqegaA" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/rxjs@5.0.0-beta.9/bundles/Rx.umd.js" integrity="sha384-MryZ1bSx4w1xnwELtXIjvuQsWk2RgsDZYc58NML9B0o4JSi+ARCLy3xAW6uvY+K1" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/core@2.0.0-rc.3/bundles/core.umd.js" integrity="sha384-inFE6BlY5M1S5IVoNhnrKXAdVkb/1VcrsUipYfNm72C3hMo1OHZsnwjkCNqXsjNh" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/common@2.0.0-rc.3/bundles/common.umd.js" integrity="sha384-IHl3Rv5Cbo8m3AvuvGPC9tZEH1YpHZmRm828Gg8W+rNCZeJMuVSwp2oHKqyt2VGl" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/compiler@2.0.0-rc.3/bundles/compiler.umd.js" integrity="sha384-nQB9ZEVdEuDn+2rmsqiKbnAielCrA7elQ7DvuI/s+jUoWsb4t9X5tlkFTnVFRwAr" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/platform-browser@2.0.0-rc.3/bundles/platform-browser.umd.js" integrity="sha384-g2iADb+i5sFawO5lpmu5KAdGKVKyJuxGkoXjzxGgtSizN+DKPC3e+8EDC1iezT9X" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/platform-browser-dynamic@2.0.0-rc.3/bundles/platform-browser-dynamic.umd.js" integrity="sha384-SxXIQLFmtjjJpthKP4KM/nhawD4qOhd+cyZoM8nWFii01+QcqTVkkjsyIvQMT2A0" crossorigin="anonymous"></script>
`;

exports.production = `${bootstrap}
<script src="https://npmcdn.com/core-js@2.4.0/client/shim.min.js" integrity="sha384-lrm+zT8wVo5kINnsGarc1MEJuo0C4mVOYjAc2r+KIyeOVU6OvEByuFd4L///FXVR" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/zone.js@0.6.12/dist/zone.min.js" integrity="sha384-MDLUOVFqLg5yC3K8k4IskyiFxAlFYxd/zLKNDHiZqiakSU3kR3bm90NnKMwx8ilw" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/reflect-metadata@0.1.3/Reflect.js" integrity="sha384-FH+k0oZoE9Oi+oLkwlSYKw854fCXw4at5e/uPQX0rHP/6Dp8iVWBlScfDNlqegaA" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/rxjs@5.0.0-beta.9/bundles/Rx.umd.min.js" integrity="sha384-cka4lu3cmSx7bVS8DzUIE4vCbjbul0QKbHU4JN2jkSEo6PzSlc7nE364vFe8RvwE" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/core@2.0.0-rc.3/bundles/core.umd.min.js" integrity="sha384-dj4kDysWr44fG/l+vo2gT0mq4Je9XdRY/tOgIEUX3a4LFtV1YHyOjYM1Ohz9wiNk" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/common@2.0.0-rc.3/bundles/common.umd.min.js" integrity="sha384-cpEVRXNm2FouojCUFmvKP8oVV2hPH8gLMoiNJC2p3KZS5e7g301MnJRIOzU7pZsQ" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/compiler@2.0.0-rc.3/bundles/compiler.umd.min.js" integrity="sha384-1fuaa3mQCCJdzRdHTtx34aw3ix7/+FefJJW3oDYYYfoJr2sb7tgNoklGC92VwWd3" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/platform-browser@2.0.0-rc.3/bundles/platform-browser.umd.min.js" integrity="sha384-QOYfTbJ3/dzHsvivxIPImXr/ZM5Xy8dvAR4Nh1qFEMaAF7Ia2o5wGKoLZBE/XkZN" crossorigin="anonymous"></script>
<script src="https://npmcdn.com/@angular/platform-browser-dynamic@2.0.0-rc.3/bundles/platform-browser-dynamic.umd.min.js" integrity="sha384-FBQnmKHmWCweJ3Wcf4reQ4kCPT/gIELkag4Lu+/ZvEfwC5JbVMw9gu/A+YVt5Rod" crossorigin="anonymous"></script>
`;
