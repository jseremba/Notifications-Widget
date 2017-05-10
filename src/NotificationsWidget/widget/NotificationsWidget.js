/*
    NotificationsWidget
    ========================

    @file      : NotificationsWidget.js
    @version   : 0.1
    @author    : Nick van Wieren
    @date      : Wed, 18 Feb 2015 09:35:50 GMT
    @copyright : 2015
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
    @version: 0.2
    @author: Arjan de Lange
    Changes: Widget now only shows the amount of notifications if there are any. So '0' will no longer be presented.
*/

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/dom-class",
    "dojo/html"
], function(declare, _WidgetBase, domClass, html) {
    "use strict";

    return declare("NotificationsWidget.widget.NotificationsWidget", [ _WidgetBase ], {
        _notificationCount: null,

        // Internal variables
        _handle: null,
        _contextObj: null,
        _objProperty: null,

        postCreate: function() {
            this.domNode.title = this.tooltipCaption;
        },

        update: function(mxObject, callback) {
            this._contextObj = mxObject;
            this._resetSubscriptions();
            this._updateCounter();
            this._setupEvents();
            if (callback) {
                callback();
            }
        },

        _setupEvents: function() {
            if (this._contextObj) {
                this.connect(this.domNode, "click", function() {
                    mx.data.action({
                        params: {
                            applyto: "selection",
                            actionname: this.actionMicroflow,
                            guids: [ this._contextObj.getGuid() ],
                            origin: this.mxform
                        },
                        callback: function() {
                            //
                        },
                        error: function(error) {
                            mx.ui.error("An error occurred while executing microflow " + this.actionMicroflow + " : " + error.description);
                        }
                    }, this);
                });
            }
        },

        _updateCounter: function() {
            this._getNotificationCount();
        },

        _updateRendering: function() {
            // Update Notification counter
            if (this.counterNode == null) {
                this.counterNode = mxui.dom.create("div", {
                    class: "NotificationCenter-counter"
                });

                if (this._notificationCount > 0) {
                    html.set(this.counterNode, this._notificationCount);
                    domClass.add(this.counterNode, "NotificationCenter-hasnewmessages");
                } else {
                    domClass.remove(this.counterNode, "NotificationCenter-hasnewmessages");
                }

                this.imgNode = mxui.dom.create("a", {}, this.counterNode);
                this.domNode.appendChild(this.imgNode);
                // dojo.attr(this.imgNode, "class", "");
            } else if (this._notificationCount > 0) {
                html.set(this.counterNode, this._notificationCount);
                domClass.add(this.counterNode, "NotificationCenter-hasnewmessages");
            } else {
                domClass.remove(this.counterNode, "NotificationCenter-hasnewmessages");
            }
        },

        _getNotificationCount: function() {
            // Fetch Notification count by microflow
            // var self = this;
            if (this._contextObj) {
                mx.data.action({
                    params: {
                        applyto: "selection",
                        actionname: this.counterMicroflow,
                        guids: [ this._contextObj.getGuid() ],
                        origin: this.mxform
                    },
                    callback: function(count) {
                        this._notificationCount = count;
                        this._updateRendering();
                    },
                    error: function(error) {
                        mx.ui.error("An error occurred while executing microflow " + this.actionMicroflow + " : " + error.description);
                    }
                }, this);
            }
        },

        _resetSubscriptions: function() {
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }

            if (this._contextObj) {
                this._handle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: this._updateCounter
                });
            }
        }
    });
});

require([ "NotificationsWidget/widget/NotificationsWidget" ]);
