import { _decorator, Component, Node, view, UITransform, Vec2, Vec3, Quat, Size, CCFloat, director, log } from 'cc'; 
import { TransformData } from './TransformData';    
import { StretchToCameraView } from './StretchToCameraView';

const { ccclass, property, menu } = _decorator;

@ccclass('ConditionalLayout')
@menu('_MyComponent/UI')
export class ConditionalLayout extends Component {
    @property({ type: TransformData })
    transformDataVertical: TransformData = null
    @property({ type: TransformData })
    transformDataHorizontal: TransformData = null
    @property({
        type: StretchToCameraView
    })
    StretchToCameraView: StretchToCameraView | null = null;

    @property({
        displayName: "► setTransformData"
    })
    get myButton(): boolean {
        return false;
    }
    set myButton(value: boolean) {
        if (value) {
            this.setTransformData();
        }
    }

    private setTransformData() {
        const data = new TransformData();
        data.position = this.node.position;
        data.rotation = this.node.rotation;
        data.scale = this.node.scale;
        data.size = this.node.getComponent(UITransform)?.contentSize;
        data.anchorPoint = this.node.getComponent(UITransform)?.anchorPoint;
        if (this.getAspectRatio() >= 0 && this.getAspectRatio() < 1) {
            this.transformDataVertical = data;
        }
        else {
            this.transformDataHorizontal = data;
        }
        console.log("Transform data set for aspect ratio:", this.getAspectRatio(), "Vertical:", this.transformDataVertical, "Horizontal:", this.transformDataHorizontal);
    }

    private getAspectRatio(): number {
        return this.StretchToCameraView ? this.StretchToCameraView.getRatio() : 0;
    }

    private onWindowResize() {
        const aspectRatio = this.getAspectRatio();
        if (aspectRatio >= 0 && aspectRatio < 1) {
            this.applyTransformData(this.transformDataVertical);
        } else {
            this.applyTransformData(this.transformDataHorizontal);
        }
    }

    private applyTransformData(data: TransformData) {
        const targetNode = this.node;
        targetNode.setPosition(data.position);
        targetNode.setRotation(data.rotation);
        targetNode.setScale(data.scale);
        const uiTransform = targetNode.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(data.size);
            uiTransform.anchorPoint = data.anchorPoint;
        }
    }
}