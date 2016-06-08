Aria.beanDefinitions({
    $package: "x.CfgBeans",
    $namespaces: {
        "json": "aria.core.JsonTypes"
    },
    $beans: {
        "ParentBean": {
            $type: "json:Object",
            $properties: {
                "myProperty1ToBeRemoved": {
                    $type: "json:String"
                },
                "propertyToBeOverriddenInChild": {
                    $type: "json:String"
                },
                "propertyToChangeDescription": {
                    $description: "my initial description",
                    $type: "json:String"
                },
                "myOtherProperty1": {
                    $type: "json:Object",
                    $properties: {
                        "myProperty2ToBeRemoved": {
                            $type: "json:String"
                        },
                        "myOtherProperty2": {
                            $type: "json:Object",
                            $properties: {
                                "myProperty3ToBeRemoved": {
                                    $type: "json:String"
                                }
                            }
                        }
                    }
                }
            }
        },
        "ChildBean": {
            $type: "ParentBean",
            $properties: {}
        },
        "ChildOfChildBean": {
            $type: "ChildBean",
            $properties: {}
        },
        "ChildOfChildOfChildBean": {
            $type: "ChildOfChildBean",
            $properties: {}
        },
        "MultiTypesParentBean": {
            $type: "json:MultiTypes",
            $contentTypes: [{
                $type: "json:Object",
                $properties: {
                    "myProperty4ToBeRemoved": {
                        $type: "json:String"
                    }
                }
            }]
        },
        "MultiTypesChildBean": {
            $type: "MultiTypesParentBean"
        },
        "OverridingMultiTypesChildBean": {
            $type: "MultiTypesParentBean",
            $contentTypes: [{
                $type: "json:Object",
                $properties: {
                    "myProperty5ToBeRemoved": {
                        $type: "json:String"
                    }
                }
            }]
        },
        "RecursiveBeanA": {
            $type: "json:Object",
            $properties: {
                "b": {
                    $type: "RecursiveBeanB"
                },
                "myProperty6ToBeRemoved": {
                    $type: "json:String"
                }
            }
        },
        "RecursiveBeanB": {
            $type: "json:Object",
            $properties: {
                "a": {
                    $type: "RecursiveBeanA"
                },
                "myProperty7ToBeRemoved": {
                    $type: "json:String"
                }
            }
        },
        "RemovedBean": {
            $type: "json:Object",
            $properties: {
                "removedBeanProperty1": {
                    $type: "json:String"
                }
            }
        },
        "BeanA": {
            $type: "json:Object",
            $properties: {
                "specificToBeanA1": {
                    $type: "json:String"
                },
                "specificToBeanA2": {
                    $type: "json:String"
                },
                "specificToBeanA3": {
                    $type: "json:String"
                },
                "commonToAAndB1": {
                    $type: "json:String"
                },
                "commonToAAndB2": {
                    $type: "json:String"
                },
                "commonToAAndB3": {
                    $type: "json:String"
                }
            }
        },
        "BeanB": {
            $type: "json:Object",
            $properties: {
                "specificToBeanB1": {
                    $type: "json:String"
                },
                "specificToBeanB2": {
                    $type: "json:String"
                },
                "specificToBeanB3": {
                    $type: "json:String"
                },
                "commonToAAndB1": {
                    $type: "json:String"
                },
                "commonToAAndB2": {
                    $type: "json:String"
                },
                "commonToAAndB3": {
                    $type: "json:String"
                }
            }
        },
        "ChangingType": {
            $type: "BeanA"
        },
        "ExtendingChangingType": {
            $type: "ChangingType"
        }
    }
});
