"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageQueue = void 0;
var test_data_1 = require("./test-data");
var MessageQueue = /** @class */ (function () {
    function MessageQueue() {
        this.queue = [];
        this.sending = false;
    }
    MessageQueue.prototype.enqueue = function (data, ackCallback, nackCallback) {
        if (ackCallback === void 0) { ackCallback = function () { }; }
        if (nackCallback === void 0) { nackCallback = function (e) {
            return console.error('Send failed:', e.error);
        }; }
        this.queue.push({ data: data, ackCallback: ackCallback, nackCallback: nackCallback });
        this.processQueue();
    };
    MessageQueue.prototype.processQueue = function () {
        var _this = this;
        if (this.sending || this.queue.length === 0) {
            return;
        }
        var message = this.queue.shift();
        this.sending = true;
        if (test_data_1.ENABLE_LOGS)
            console.info('Sending message', Object.keys(message.data));
        this.sendTimer = setTimeout(function () {
            if (_this.sending) {
                console.error('Message send timeout, unblocking queue');
                message.nackCallback({ error: { message: 'timeout' } });
                _this.sending = false;
                _this.processQueue();
            }
        }, MessageQueue.SEND_TIMEOUT_MS);
        try {
            Pebble.sendAppMessage(message.data, function (e) {
                clearTimeout(_this.sendTimer);
                _this.sendTimer = undefined;
                message.ackCallback(e);
                _this.sending = false;
                _this.processQueue();
            }, function (e) {
                clearTimeout(_this.sendTimer);
                _this.sendTimer = undefined;
                message.nackCallback(e);
                _this.sending = false;
                _this.processQueue();
            });
        }
        catch (e) {
            clearTimeout(this.sendTimer);
            this.sendTimer = undefined;
            this.sending = false;
            message.nackCallback({ data: {}, error: { message: 'sendAppMessage threw: ' + e } });
            this.processQueue();
        }
    };
    MessageQueue.prototype.clear = function () {
        this.queue = [];
        if (this.sendTimer !== undefined) {
            clearTimeout(this.sendTimer);
            this.sendTimer = undefined;
        }
    };
    Object.defineProperty(MessageQueue.prototype, "length", {
        get: function () {
            return this.queue.length;
        },
        enumerable: false,
        configurable: true
    });
    MessageQueue.SEND_TIMEOUT_MS = 4000;
    return MessageQueue;
}());
exports.messageQueue = new MessageQueue();
