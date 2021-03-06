/* globals WAY, WAYModuleLoader */
// ============================================================================
// WAY_CustomFaceImageEval.js
// ============================================================================
/*:
@plugindesc v1.1.0 Set different face images using Lunatic Code. <WAY_CustomFaceImageEval>

@author waynee95

@help
==============================================================================
 ■ Lunatic Mode - Custom Face Image Eval
==============================================================================
--- Actor Notetag:

<Custom Face Image Eval>
if (user.hp / user.mhp <= 0) {
	faceName = 'Actor1';
	faceIndex = 0;
} else if (user.hp / user.mhp <= 0.5) {
	faceName = 'Actor1';
	faceIndex = 1;
} else if (user.hp / user.mhp <= 1) {
	faceName = 'Actor1';
	faceIndex = 2;
} 
if (user.isStateAffected(42)) {
	faceName = 'Nature';
	faceIndex = 2;
}
</Custom Face Image Eval>

You can use 'user' to reference the actor. There are 2 variables you can change.
'faceName' refers to the filename for the face image.
'faceIndex' refers to the face index.
If any of those variables is not set, the default vaules will be used instead.

Also you can use shortcuts for referencing switches, variables and 
the game party. Instead of using $gameSwitches, $gameVariables and $gameParty,
you can just use s, v, and p.

==============================================================================
 ■ Terms of Use
==============================================================================
Credit must be given to: waynee95
Please don't share my plugins anywhere, except if you have my permissions.

My plugins may be used in commercial and non-commercial products.

==============================================================================
 ■ Contact Information
==============================================================================
Forum Link: https://forums.rpgmakerweb.com/index.php?members/waynee95.88436/
Website: http://waynee95.me/
Discord Name: waynee95#4261
*/

'use strict';

if (typeof WAY === 'undefined') {
    console.error('You need to install WAY_Core!'); //eslint-disable-line no-console
    if (Utils.isNwjs() && Utils.isOptionValid('test')) {
        var gui = require('nw.gui'); //eslint-disable-line
        gui.Window.get().showDevTools();
    }
    SceneManager.stop();
} else {
    WAYModuleLoader.registerPlugin('WAY_CustomFaceImageEval', '1.1,0', 'waynee95', {
        name: 'WAY_Core',
        version: '>= 2.0.0'
    });
}

($ => {
    const { getMultiLineNotetag, trim } = WAY.Util;

    WAY.EventEmitter.on('load-actor-notetags', actor => {
        actor.customFaceImageEval = getMultiLineNotetag(
            actor.note,
            'Custom Face Image Eval',
            null,
            trim
        );
    });

    const evalCode = (user, code) => {
        /* eslint-disable */
        const a = user;
        const s = $gameSwitches._data;
        const v = $gameVariables._data;
        const p = $gameParty;
        let faceName = user._defaultFaceName;
        let faceIndex = user._defaultFaceIndex;
        try {
            eval(code);
            /* eslint-enable */
        } catch (e) {
            throw e;
        }

        return { faceName, faceIndex };
    };

    //=============================================================================
    // Game_Actor
    //=============================================================================
    $.alias.Game_Actor_initImages = Game_Actor.prototype.initImages;
    Game_Actor.prototype.initImages = function () {
        $.alias.Game_Actor_initImages.call(this);
        this._defaultFaceName = this._faceName;
        this._defaultFaceIndex = this._faceIndex;
    };

    $.alias.Game_Actor_refresh = Game_Actor.prototype.refresh;
    Game_Actor.prototype.refresh = function () {
        $.alias.Game_Actor_refresh.call(this);
        const { faceName, faceIndex } = evalCode(this, this.actor().customFaceImageEval);
        this.setFaceImage(faceName, faceIndex);
    };
})(WAYModuleLoader.getModule('WAY_CustomFaceImageEval'));
