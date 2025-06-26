import { _decorator, Camera, Component } from 'cc';
import { AdaptiveLayout } from './AdaptiveLayout';
const { ccclass, property } = _decorator;

@ccclass('OrthoHeightController')
export class OrthoHeightController extends Component{
    @property(Camera)
    camera: Camera | null = null; 

    public onResize(aspectRatio: number) {
        console.log("OrthoHeightController")
        const horizontalRatio = 1336 / 750;
        const verticalRatio = 750 / 1336;
        if (aspectRatio > 1 && aspectRatio < horizontalRatio) {
            // Vertical orientation
            this.camera.orthoHeight = 1190 * (1 / aspectRatio);
        }
        else {
            // Horizontal orientation
            this.camera.orthoHeight = 668
        }
    }
}
