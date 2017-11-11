/* globals WAY, WAYModuleLoader */
// ============================================================================
// WAY_CustomOnDeathEval.js
// ============================================================================
/*:
@plugindesc v1.0.1 Run code when a battler dies. <WAY_CustomOnDeathEval>
@author waynee95

@help
==============================================================================
■ Lunatic Mode - Custom On Death Eval
==============================================================================
-- Actor, Class, Enemy, Weapon, Armor, State notetag:

<Custom On Death Eval>
code
</Custom On Death Eval>

This will run when the battler dies. You can use 'user' or 'a' to reference the 
died battler. You can use 'killer' or 'b' to reference the battler who killed 
the user. Also you can use shortcuts for referencing switches, variables and 
the game party. Instead of using $gameSwitches, $gameVariables and $gameParty,
you can just use s, v, and p.

==============================================================================
 ■ Terms of Use
==============================================================================
Credit must be given to: waynee95
Please don't share my plugins anywhere, except if you have my permissions.

My plugins may be used in commercial and non-commercial products.
*/

'use strict';

if (WAY === undefined) {
    console.error('You need to install WAY_Core!'); //eslint-disable-line no-console
    if (Utils.isNwjs() && Utils.isOptionValid('test')) {
        var gui = require('nw.gui'); //eslint-disable-line
        gui.Window.get().showDevTools();
    }
    SceneManager.stop();
} else {
    WAYModuleLoader.registerPlugin('WAY_CustomOnDeathEval', '1.0.1', 'waynee95');
}

(function ($) {
    var _WAY$Util = WAY.Util,
        extend = _WAY$Util.extend,
        getMultiLineNotetag = _WAY$Util.getMultiLineNotetag,
        trim = _WAY$Util.trim;


    var parseNotetags = function () {
        function parseNotetags(obj) {
            obj.customOnDeathEval = getMultiLineNotetag(obj.note, 'Custom On Death Eval', null, trim);
        }

        return parseNotetags;
    }();

    WAY.EventEmitter.on('load-actor-notetags', parseNotetags);
    WAY.EventEmitter.on('load-class-notetags', parseNotetags);
    WAY.EventEmitter.on('load-enemy-notetags', parseNotetags);
    WAY.EventEmitter.on('load-armor-notetags', parseNotetags);
    WAY.EventEmitter.on('load-weapon-notetags', parseNotetags);
    WAY.EventEmitter.on('load-state-notetags', parseNotetags);

    (function (Game_Battler) {
        Game_Battler.customOnDeathEval = function () {
            var code = '';
            this.states().forEach(function (obj) {
                if (obj && obj.customOnDeathEval && obj.customOnDeathEval !== '') {
                    code += '\n' + String(obj.customOnDeathEval);
                }
            });
            return code;
        };

        Game_Battler.evalCustomOnDeathEval = function (subject, target) {
            var code = this.customOnDeathEval();
            var user = subject;
            var killer = target;
            var a = subject;
            var b = target;
            var s = $gameSwitches._data;
            var v = $gameVariables._data;
            var p = $gameParty;
            try {
                eval(code);
            } catch (e) {
                throw e;
            }
        };
    })(Game_Battler.prototype);

    (function (Game_Actor) {
        Game_Actor.customOnDeathEval = function () {
            var code = Game_Battler.prototype.customOnDeathEval.call(this);
            this.equips().forEach(function (obj) {
                if (obj && obj.customOnDeathEval && obj.customOnDeathEval !== '') {
                    code += '\n' + String(obj.customOnDeathEval);
                }
            });
            var currentClass = this.currentClass();
            if (currentClass.customOnDeathEval && currentClass.customOnDeathEval !== '') {
                code += '\n' + String(currentClass.customOnDeathEval);
            }
            var actor = this.actor();
            if (actor.customOnDeathEval && actor.customOnDeathEval !== '') {
                code += '\n' + String(actor.customOnDeathEval);
            }
            return code;
        };
    })(Game_Actor.prototype);

    (function (Game_Enemy) {
        Game_Enemy.customOnDeathEval = function () {
            var code = Game_Battler.prototype.customOnDeathEval.call(this);
            var enemy = this.enemy();
            if (enemy.customOnDeathEval && enemy.customOnDeathEval !== '') {
                code += '\n' + String(enemy.customOnDeathEval);
            }
            return code;
        };
    })(Game_Enemy.prototype);

    (function (Game_Action, alias) {
        alias.Game_Action_executeHpDamage = Game_Action.executeHpDamage;
        extend(Game_Action, 'executeHpDamage', function (target) {
            if (target.hp < 1 || target.isDead()) {
                target.evalCustomOnDeathEval(target, this.subject());
            }
        });
    })(Game_Action.prototype, $.alias);
})(WAYModuleLoader.getModule('WAY_CustomOnDeathEval'));