Aria.beanDefinitions({
    $package: "y.CfgBeans",
    $namespaces: {
        "json": "aria.core.JsonTypes",
        "cfg": "x.CfgBeans"
    },
    $beans: {
        "UsesRemovedBean": {
            $type: "cfg:RemovedBean"
        },
        "UsesPropertyInRemovedBean": {
            $type: "cfg:RemovedBean.removedBeanProperty1"
        },
        "OverridesParent": {
            $type: "cfg:ChildBean",
            $properties: {
                "myProperty1ToBeRemoved": {
                    $type: "cfg:ParentBean.myProperty1ToBeRemoved"
                },
                "propertyToChangeDescription": {
                    $description: "my overridden description",
                    $type: "cfg:ChildBean.propertyToChangeDescription"
                },
                "myProperty1ToBeAdded": {
                    // this property does not exist in the old version of the parent
                    // but is added in the new version of the parent
                    $type: "json:String"
                },
                "propertyToBeOverriddenInChild": {
                    // this property is overridden in ChildBean in the new version
                    // but the $type property references directly the old ancestor
                    // (this is not advised but it works in Aria Templates)
                    // we now have to inherit from ChildBean
                    $type: "cfg:ParentBean.propertyToBeOverriddenInChild"
                }
            }
        },
        "ChildOfExtendingChangingType": {
            $type: "cfg:ExtendingChangingType",
            $properties: {
                "specificToBeanA1": {
                    // this property exists in the old parent but not in the new
                    $type: "cfg:ChangingType.specificToBeanA1"
                },
                "specificToBeanB1": {
                    // this property exists in the new parent but not in the old
                    $type: "json:String"
                },
                "commonToAAndB1": {
                    // this property exists both in the old and the new parent
                    // but the $type property references directly the old ancestor
                    // (this is not advised but it works in Aria Templates)
                    // with the change of type of the parent, we can no longer inherit from BeanA
                    $type: "cfg:BeanA.specificToBeanA1"
                }
            }
        }
    }
});
