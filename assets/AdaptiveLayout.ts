import { _decorator, Component, UITransform } from 'cc';
const { ccclass } = _decorator;

@ccclass('AdaptiveLayout')
export class AdaptiveLayout extends Component {
    public onResize(aspectRatio: Number) {
        // Handle resize logic here
        console.log('AdaptiveLayout resized');
    }
}


