import { Vec2, Vec3, Quat, Size } from 'cc';
import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TransformData')
export class TransformData {
    @property
    public position: Vec3 = new Vec3();
    @property
    public rotation: Quat = new Quat();
    @property
    public scale: Vec3 = new Vec3(1, 1, 1);
    @property
    public size: Size = new Size(100, 100);
    @property
    public anchorPoint: Vec2 = new Vec2(0.5, 0.5);
}