Aria.beanDefinitions({
    $package: "x.CfgBeans",
    $namespaces: {
        "json": "aria.core.JsonTypes"
    },
    $beans: {
        "ParentBean": {
            $type: "json:Object",
            $properties: {
                "myProperty1ToBeAdded": {
                    $type: "json:String"
                },
                "propertyToBeOverriddenInChild": {
                    $type: "json:String"
                },
                "propertyToChangeDescription": {
                    $description: "my final description",
                    $type: "json:String"
                },
                "myOtherProperty1": {
                    $type: "json:Object",
                    $properties: {
                        "myProperty2ToBeAdded": {
                            $type: "json:String"
                        },
                        "myOtherProperty2": {
                            $type: "json:Object",
                            $properties: {
                                "myProperty3ToBeAdded": {
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
            $properties: {
                "propertyToBeOverriddenInChild": {
                    $type: "ParentBean.propertyToBeOverriddenInChild"
                }
            }
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
                    "myProperty4ToBeAdded": {
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
                    "myProperty5ToBeAdded": {
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
                "myProperty6ToBeAdded": {
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
                "myProperty7ToBeAdded": {
                    $type: "json:String"
                }
            }
        },
        "AddedBean": {
            $type: "json:Object",
            $properties: {
                "addedBeanProperty1": {
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
            $type: "BeanB"
        },
        "ExtendingChangingType": {
            $type: "ChangingType"
        }
    }
});
