import { _decorator, Button, Color, Component, instantiate, Label, Node, Prefab, Sprite } from 'cc';
import super_html_playable from './super_html_playable';
const { ccclass, property } = _decorator;

@ccclass('playableScene')
export class playableScene extends Component {

    onLoad() {
        // super_html_playable.set_google_play_url("https://play.google.com/store/apps/details?id=com.lutech.fakevideocall");
        // super_html_playable.set_app_store_url("https://apps.apple.com/us/app/ad-testing/id1463016906");
    }

    on_click_game_end() {
        super_html_playable.game_end();
    }

    on_click_download() {
        super_html_playable.download();
    }
}