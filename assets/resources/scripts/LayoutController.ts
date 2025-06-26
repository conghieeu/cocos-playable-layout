import { _decorator, Component, Node } from 'cc';
import { AdaptiveLayout } from './AdaptiveLayout';
const { ccclass, property } = _decorator;

@ccclass('LayoutController')
export class LayoutController extends Component {
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

    @property({
        type: [AdaptiveLayout], // Dùng dấu ngoặc vuông [] để biểu thị đây là một mảng
        tooltip: 'Kéo các Node có chứa component AdaptiveLayout vào đây'
    })
    adaptiveLayouts: AdaptiveLayout[] = [];

    // onWindowResize() {
    //     this.adaptiveLayouts.forEach(layout => {
    //         if (this.getRatio() > 1) {
    //             layout.LoadTransformDataHorizontal();
    //         } else {
    //             layout.LoadTransformDataVertical();
    //         }
    //         layout.onResize(this.getRatio());
    //     });
    // }

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

    private getAllAdaptiveLayouts() {
        this.adaptiveLayouts.length = 0;
        const allLayouts = this.node.scene.getComponentsInChildren(AdaptiveLayout);
        this.adaptiveLayouts = allLayouts;
    }
}


