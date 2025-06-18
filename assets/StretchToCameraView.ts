import { _decorator, Component, screen, view, UITransform } from 'cc';
import { ConditionalLayout } from './ConditionalLayout';
const { ccclass, property } = _decorator;

@ccclass('StretchToCameraView')
export class StretchToCameraView extends Component {
    // Bây giờ thuộc tính này sẽ hiển thị đúng
    @property({
        type: [ConditionalLayout], // Dùng dấu ngoặc vuông [] để biểu thị đây là một mảng
        tooltip: 'Kéo các Node có chứa component ConditionalLayout vào đây'
    })
    conditionalLayouts: ConditionalLayout[] = [];

    onLoad() {
        view.setResizeCallback(() => {
            this.onWindowResize();
        });
        this.onWindowResize();
    }

    public getRatio() {
        let ratio = this.node.getComponent(UITransform).width / this.node.getComponent(UITransform).height;
        return ratio;
    }

    onWindowResize() {
        let size = this.getSize();
        this.node.getComponent(UITransform).setContentSize(size.width, size.height);
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
}
