import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

/**
 * SortingLayer
 * 
 * Component quản lý thứ tự hiển thị (z-index) của một node.
 * Tự động set indexLayer dựa trên kích thước của node (width * height).
 * Node có kích thước lớn hơn sẽ hiển thị phía trên.
 */
@ccclass('SortingLayer')
@executeInEditMode(true)
export class SortingLayer extends Component {
    @property({
        tooltip: "Thứ tự hiển thị của node (càng lớn càng hiển thị phía trên)"
    })
    indexLayer: number = 0;

    @property({
        tooltip: "Tự động set indexLayer theo kích thước của node"
    })
    autoSetBySize: boolean = false;

    private lastSize: number = 0;

    protected update(dt: number): void {
        if (this.autoSetBySize) {
            this.updateIndexBySize();
        }
        this.node.setSiblingIndex(this.indexLayer);
    }

    private updateIndexBySize(): void {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;

        const currentSize = uiTransform.width * uiTransform.height;

        // Chỉ cập nhật khi kích thước thay đổi
        if (this.lastSize === currentSize) {
            return;
        }
        this.lastSize = currentSize;

        // Lấy tất cả các node cùng parent
        const parent = this.node.parent;
        if (!parent) return;

        const siblings = parent.children;
        const sizeRanking: { node: Node, size: number }[] = [];

        // Tính toán kích thước của tất cả các node cùng parent
        for (const sibling of siblings) {
            const siblingTransform = sibling.getComponent(UITransform);
            if (siblingTransform) {
                const size = siblingTransform.width * siblingTransform.height;
                sizeRanking.push({ node: sibling, size: size });
            }
        }

        // Sắp xếp theo kích thước giảm dần
        sizeRanking.sort((a, b) => b.size - a.size);

        // Tìm vị trí của node hiện tại trong danh sách đã sắp xếp
        const currentIndex = sizeRanking.findIndex(item => item.node === this.node);
        if (currentIndex !== -1) {
            this.indexLayer = currentIndex;
        }
    }
}


