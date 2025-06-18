import { _decorator, Component, Node, UITransform, Vec2, Enum, EventHandler } from "cc";
import { AdaptiveLayout } from "./AdaptiveLayout";
const { ccclass, property, executeInEditMode } = _decorator;

enum AspectMode {
    None = 0,
    FitInside = 1,
    FitOutside = 2,
}

enum AlignmentType {
    Start = 0,
    Center = 1,
    End = 2,
}

@ccclass('AspectRatioFitter')
@executeInEditMode
export class AspectRatioFitter extends AdaptiveLayout {
    @property({
        tooltip: 'Tỷ lệ khung hình mong muốn (width/height)'
    })
    aspectRatio: number = 1.0;

    @property({
        tooltip: 'Theo chiều rộng'
    })
    isFollowWidth: boolean = true;

    @property({
        tooltip: 'Theo chiều cao'
    })
    isFollowHeight: boolean = true;

    @property({
        type: Enum(AspectMode),
        tooltip: 'Chế độ tỷ lệ khung hình'
    })
    aspectMode: AspectMode = AspectMode.FitInside;

    @property({
        tooltip: 'Bật/tắt tính năng padding',
        group: 'Padding'
    })
    enablePadding: boolean = false;

    @property({
        tooltip: 'Padding theo tỷ lệ (true) hoặc theo pixel (false)',
        group: 'Padding',
        visible: function (this: AspectRatioFitter) { return this.enablePadding; }
    })
    isRelativePadding: boolean = true;

    @property({
        type: Enum(AlignmentType),
        tooltip: 'Căn chỉnh theo chiều ngang'
    })
    horizontalAlignment: AlignmentType = AlignmentType.Center;

    @property({
        type: Enum(AlignmentType),
        tooltip: 'Căn chỉnh theo chiều dọc'
    })
    verticalAlignment: AlignmentType = AlignmentType.Center;

    @property({
        tooltip: 'Khoảng cách với cạnh trái',
        group: 'Padding',
        visible: function (this: AspectRatioFitter) { return this.enablePadding; }
    })
    paddingLeft: number = 0;

    @property({
        tooltip: 'Khoảng cách với cạnh phải',
        group: 'Padding',
        visible: function (this: AspectRatioFitter) { return this.enablePadding; }
    })
    paddingRight: number = 0;

    @property({
        tooltip: 'Khoảng cách với cạnh trên',
        group: 'Padding',
        visible: function (this: AspectRatioFitter) { return this.enablePadding; }
    })
    paddingTop: number = 0;

    @property({
        tooltip: 'Khoảng cách với cạnh dưới',
        group: 'Padding',
        visible: function (this: AspectRatioFitter) { return this.enablePadding; }
    })
    paddingBottom: number = 0;

    private _uiTransform: UITransform | null = null;
    private _originalParentSize: Vec2 = new Vec2(0, 0);

    start() {
        this._uiTransform = this.getComponent(UITransform);
        this.aspectRatio = this._uiTransform.width / this._uiTransform.height;
        this.saveOriginalParentSize();
    }

    public override onResize(aspectRatio: Number): void {
        if (this.aspectMode === AspectMode.FitInside) {
            this.InsideAspectRatio();
        } else if (this.aspectMode === AspectMode.FitOutside) {
            this.OutsideAspectRatio();
        }
    }

    private saveOriginalParentSize() {
        const parent = this.node.parent;
        if (!parent) return;

        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) return;

        this._originalParentSize.x = parentTransform.width;
        this._originalParentSize.y = parentTransform.height;
    }

    private getScaledPadding(originalPadding: number, currentSize: number, originalSize: number): number {
        if (!this.enablePadding) return 0;

        // Nếu padding theo pixel thì trả về giá trị gốc
        if (!this.isRelativePadding) {
            return originalPadding;
        }

        // Nếu padding theo tỷ lệ thì tính toán theo scale
        return originalPadding * (currentSize / originalSize);
    }

    getRotatedDimensions(width: number, height: number, angle: number): Vec2 {
        const rad = angle * Math.PI / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));

        const rotatedWidth = width * cos + height * sin;
        const rotatedHeight = width * sin + height * cos;

        return new Vec2(rotatedWidth, rotatedHeight);
    }

    private getEffectivePadding(value: number): number {
        return this.enablePadding ? value : 0;
    }

    InsideAspectRatio() {
        const parent = this.node.parent;
        if (!parent) return;

        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) return;

        // Tính padding theo tỷ lệ scale của parent
        const effectivePaddingLeft = this.getScaledPadding(
            this.paddingLeft,
            parentTransform.width,
            this._originalParentSize.x
        );
        const effectivePaddingRight = this.getScaledPadding(
            this.paddingRight,
            parentTransform.width,
            this._originalParentSize.x
        );
        const effectivePaddingTop = this.getScaledPadding(
            this.paddingTop,
            parentTransform.height,
            this._originalParentSize.y
        );
        const effectivePaddingBottom = this.getScaledPadding(
            this.paddingBottom,
            parentTransform.height,
            this._originalParentSize.y
        );

        // Tính toán kích thước khả dụng sau khi trừ padding
        const availableWidth = parentTransform.width - (effectivePaddingLeft + effectivePaddingRight);
        const availableHeight = parentTransform.height - (effectivePaddingTop + effectivePaddingBottom);

        const parentAngle = -parent.eulerAngles.z;
        const rotatedParent = this.getRotatedDimensions(
            availableWidth,
            availableHeight,
            parentAngle
        );

        let newWidth: number, newHeight: number;

        if (this.isFollowWidth && !this.isFollowHeight) {
            newWidth = rotatedParent.x;
            newHeight = newWidth / this.aspectRatio;
        } else if (this.isFollowHeight && !this.isFollowWidth) {
            newHeight = rotatedParent.y;
            newWidth = newHeight * this.aspectRatio;
        } else if (this.isFollowWidth && this.isFollowHeight) {
            if (rotatedParent.x / rotatedParent.y < this.aspectRatio) {
                newWidth = rotatedParent.x;
                newHeight = newWidth / this.aspectRatio;
            } else {
                newHeight = rotatedParent.y;
                newWidth = newHeight * this.aspectRatio;
            }
        }

        const nodeAngle = -this.node.eulerAngles.z;
        const adjustedDimensions = this.getRotatedDimensions(
            newWidth,
            newHeight,
            -nodeAngle
        );

        this._uiTransform.width = adjustedDimensions.x;
        this._uiTransform.height = adjustedDimensions.y;

        // Tính toán vị trí X dựa trên horizontalAlignment
        let newX = 0;
        switch (this.horizontalAlignment) {
            case AlignmentType.Start:
                newX = -parentTransform.width / 2 + effectivePaddingLeft + this._uiTransform.width / 2;
                break;
            case AlignmentType.Center:
                newX = (-parentTransform.width / 2 + effectivePaddingLeft + parentTransform.width / 2 - effectivePaddingRight) / 2;
                break;
            case AlignmentType.End:
                newX = parentTransform.width / 2 - effectivePaddingRight - this._uiTransform.width / 2;
                break;
        }

        // Tính toán vị trí Y dựa trên verticalAlignment
        let newY = 0;
        switch (this.verticalAlignment) {
            case AlignmentType.Start:
                newY = -parentTransform.height / 2 + effectivePaddingBottom + this._uiTransform.height / 2;
                break;
            case AlignmentType.Center:
                newY = (-parentTransform.height / 2 + effectivePaddingBottom + parentTransform.height / 2 - effectivePaddingTop) / 2;
                break;
            case AlignmentType.End:
                newY = parentTransform.height / 2 - effectivePaddingTop - this._uiTransform.height / 2;
                break;
        }

        this.node.setPosition(newX, newY, this.node.position.z);
    }

    OutsideAspectRatio() {
        if (!this._uiTransform) {
            this._uiTransform = this.getComponent(UITransform);
            if (!this._uiTransform) return;
        }

        const parent = this.node.parent;
        if (!parent) return;

        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) return;

        // Tính padding theo tỷ lệ scale của parent
        const effectivePaddingLeft = this.getScaledPadding(
            this.paddingLeft,
            parentTransform.width,
            this._originalParentSize.x
        );
        const effectivePaddingRight = this.getScaledPadding(
            this.paddingRight,
            parentTransform.width,
            this._originalParentSize.x
        );
        const effectivePaddingTop = this.getScaledPadding(
            this.paddingTop,
            parentTransform.height,
            this._originalParentSize.y
        );
        const effectivePaddingBottom = this.getScaledPadding(
            this.paddingBottom,
            parentTransform.height,
            this._originalParentSize.y
        );

        // Tính toán kích thước khả dụng sau khi trừ padding
        const availableWidth = parentTransform.width - (effectivePaddingLeft + effectivePaddingRight);
        const availableHeight = parentTransform.height - (effectivePaddingTop + effectivePaddingBottom);

        const parentAngle = -parent.eulerAngles.z;
        const rotatedParent = this.getRotatedDimensions(
            availableWidth,
            availableHeight,
            parentAngle
        );

        let newWidth: number, newHeight: number;

        if (this.isFollowWidth && !this.isFollowHeight) {
            newWidth = rotatedParent.x;
            newHeight = newWidth / this.aspectRatio;
        } else if (this.isFollowHeight && !this.isFollowWidth) {
            newHeight = rotatedParent.y;
            newWidth = newHeight * this.aspectRatio;
        } else if (this.isFollowWidth && this.isFollowHeight) {
            if (rotatedParent.x / rotatedParent.y > this.aspectRatio) {
                newWidth = rotatedParent.x;
                newHeight = newWidth / this.aspectRatio;
            } else {
                newHeight = rotatedParent.y;
                newWidth = newHeight * this.aspectRatio;
            }
        }

        const nodeAngle = -this.node.eulerAngles.z;
        const adjustedDimensions = this.getRotatedDimensions(
            newWidth,
            newHeight,
            -nodeAngle
        );

        this._uiTransform.width = adjustedDimensions.x;
        this._uiTransform.height = adjustedDimensions.y;

        // Tính toán vị trí X dựa trên horizontalAlignment
        let newX = 0;
        switch (this.horizontalAlignment) {
            case AlignmentType.Start:
                newX = -parentTransform.width / 2 + effectivePaddingLeft + this._uiTransform.width / 2;
                break;
            case AlignmentType.Center:
                newX = (-parentTransform.width / 2 + effectivePaddingLeft + parentTransform.width / 2 - effectivePaddingRight) / 2;
                break;
            case AlignmentType.End:
                newX = parentTransform.width / 2 - effectivePaddingRight - this._uiTransform.width / 2;
                break;
        }

        // Tính toán vị trí Y dựa trên verticalAlignment
        let newY = 0;
        switch (this.verticalAlignment) {
            case AlignmentType.Start:
                newY = -parentTransform.height / 2 + effectivePaddingBottom + this._uiTransform.height / 2;
                break;
            case AlignmentType.Center:
                newY = (-parentTransform.height / 2 + effectivePaddingBottom + parentTransform.height / 2 - effectivePaddingTop) / 2;
                break;
            case AlignmentType.End:
                newY = parentTransform.height / 2 - effectivePaddingTop - this._uiTransform.height / 2;
                break;
        }

        this.node.setPosition(newX, newY, this.node.position.z);
    }

    // Thêm method để cập nhật kích thước gốc của parent khi cần
    public updateOriginalParentSize() {
        this.saveOriginalParentSize();
    }
}
