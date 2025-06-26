import { _decorator, Component, UITransform } from 'cc';
import { TransformData } from './TransformData';
import { StretchToCameraView } from './StretchToCameraView';
import { AdaptiveLayout } from './AdaptiveLayout';

const { ccclass, property, menu } = _decorator;

@ccclass('ConditionalLayout')
@menu('_MyComponent/ConditionalLayout')
export class ConditionalLayout extends AdaptiveLayout {
    @property({
        displayName: "► setVertical"
    })
    set setDataVertical(value: boolean) {
        if (value) {
            const data = this.getTransformData();
            this.transformDataVertical = this.cloneTransformData(data);
        }
    }

    @property({
        displayName: "► setHorizontal"
    })
    set setDataHorizontal(value: boolean) {
        if (value) {
            const data = this.getTransformData();
            this.transformDataHorizontal = this.cloneTransformData(data);
        }
    }

    @property({ type: TransformData })
    transformDataVertical: TransformData = new TransformData();
    @property({ type: TransformData })
    transformDataHorizontal: TransformData = new TransformData();

    private getTransformData() {
        const data = new TransformData();
        data.position = this.node.position;
        data.rotation = this.node.rotation;
        data.scale = this.node.scale;
        data.size = this.node.getComponent(UITransform)?.contentSize;
        data.anchorPoint = this.node.getComponent(UITransform)?.anchorPoint;
        data.active = this.node.active;
        return data;
    }

    public LoadTransformDataVertical() {
        this.applyTransformData(this.transformDataVertical);
    }

    public LoadTransformDataHorizontal() {
        this.applyTransformData(this.transformDataHorizontal);
    }

    private applyTransformData(data: TransformData) {
        const targetNode = this.node;
        targetNode.active = data.active;
        targetNode.setPosition(data.position);
        targetNode.setRotation(data.rotation);
        targetNode.setScale(data.scale);
        const uiTransform = targetNode.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(data.size);
            uiTransform.anchorPoint = data.anchorPoint;
        }
    }

    private cloneTransformData(source: TransformData): TransformData {
        const clone = new TransformData();
        // Copy position
        clone.position.x = source.position.x;
        clone.position.y = source.position.y;
        clone.position.z = source.position.z;
        // Copy rotation
        clone.rotation.x = source.rotation.x;
        clone.rotation.y = source.rotation.y;
        clone.rotation.z = source.rotation.z;
        clone.rotation.w = source.rotation.w;
        // Copy scale
        clone.scale.x = source.scale.x;
        clone.scale.y = source.scale.y;
        clone.scale.z = source.scale.z;
        // Copy size
        clone.size.width = source.size.width;
        clone.size.height = source.size.height;
        // Copy anchor point
        clone.anchorPoint.x = source.anchorPoint.x;
        clone.anchorPoint.y = source.anchorPoint.y;
        // Copy active state
        clone.active = source.active;
        return clone;
    }
}