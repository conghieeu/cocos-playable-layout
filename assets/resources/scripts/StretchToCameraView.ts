import { Camera, _decorator, Component, screen, view, UITransform } from 'cc';
import { ConditionalLayout } from './ConditionalLayout';
import { AdaptiveLayout } from './AdaptiveLayout';
import { OrthoHeightController } from './OrthoHeightController';
const { ccclass, property } = _decorator;

@ccclass('StretchToCameraView')
export class StretchToCameraView extends Component {
    @property({
        displayName: "► Load Vertical"
    })
    get setDataVertical(): boolean {
        return false;
    }
    set setDataVertical(value: boolean) {
        if (value) {
            this.LoadTransformDataVertical();
        }
    }

    @property({
        displayName: "► Load Horizontal"
    })
    get setDataHorizontal(): boolean {
        return false;
    }
    set setDataHorizontal(value: boolean) {
        if (value) {
            this.LoadTransformDataHorizontal();
        }
    }

    // Bây giờ thuộc tính này sẽ hiển thị đúng
    @property({
        type: [AdaptiveLayout], // Dùng dấu ngoặc vuông [] để biểu thị đây là một mảng
        tooltip: 'Kéo các Node có chứa component AdaptiveLayout vào đây'
    })
    adaptiveLayouts: AdaptiveLayout[] = [];

    @property(Camera)
    camera: Camera | null = null;

    onLoad() {
        this.getAllAdaptiveLayouts();
        view.setResizeCallback(() => {
            this.onWindowResize();
        });
    }

    protected start(): void {
        this.onWindowResize();
    }

    public LoadTransformDataVertical() {
        this.getAllAdaptiveLayouts();
        this.adaptiveLayouts.forEach(element => {
            element.LoadTransformDataVertical();
        });
    }

    public LoadTransformDataHorizontal() {
        this.getAllAdaptiveLayouts();
        this.adaptiveLayouts.forEach(element => {
            element.LoadTransformDataHorizontal();
        });
    }

    public getRatio() {
        let ratio = this.node.getComponent(UITransform).width / this.node.getComponent(UITransform).height;
        return ratio;
    }

    onWindowResize() {
        let size = this.getSize();
        this.node.getComponent(UITransform).setContentSize(size.width, size.height);
        this.adaptiveLayouts.forEach(layout => {
            if (this.getRatio() > 1) {
                layout.LoadTransformDataHorizontal();
            } else {
                layout.LoadTransformDataVertical();
            }
            layout.onResize(this.getRatio());
        });
        this.camera.getComponent(OrthoHeightController).onResize(this.getRatio());
        let cameraOffset = this.camera.orthoHeight / 668;
        this.node.getComponent(UITransform).setContentSize(size.width * cameraOffset, size.height * cameraOffset);
    }

    public getSize() {
        let screenSize = screen.windowSize;
        let designResolution = view.getVisibleSize();
        let ScreenRatio = screenSize.width / screenSize.height;
        let DesignRatio = designResolution.width / designResolution.height;
        if (ScreenRatio > DesignRatio) {
            designResolution.width = designResolution.height * ScreenRatio;
        }
        else {
            designResolution.height = designResolution.width * (1 / ScreenRatio);
        } 
        return {
            width: designResolution.width,
            height: designResolution.height
        }
    }

    private getAllAdaptiveLayouts() {
        this.adaptiveLayouts.length = 0;
        const allLayouts = this.node.scene.getComponentsInChildren(AdaptiveLayout);
        this.adaptiveLayouts = allLayouts;
    }
}