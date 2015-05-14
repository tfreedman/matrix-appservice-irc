/*
 * Mock replacement for 'matrix-js-sdk'.
 */
"use strict";
var q = require("q");
var suppliedConfig = null;
var mockClient = {};

/**
 * Stub method for creating a new SDK client.
 * @param {Object} config : The SDK client configuration.
 * @return {SdkClient} The SDK client instance.
 */
module.exports.createClient = function(config) {
    suppliedConfig = config;
    return mockClient;
};

/**
 * Stub method for request calls. Does nothing.
 * @param {Function} requestFn
 */
module.exports.request = function(requestFn) {
    // ignore the request fn, as that will actually invoke HTTP requests.
};

/**
 * Get the Matrix Client SDK global instance.
 * @return {SdkClient} The Matrix Client SDK
 */
module.exports._client = function() {
    return mockClient;
};

/**
 * Reset the Matrix Client SDK global instance.
 */
module.exports._reset = function() {
    suppliedConfig = null;
    mockClient = {
        credentials: {},
        register: jasmine.createSpy("sdk.register(loginType, data)"),
        createRoom: jasmine.createSpy("sdk.createRoom(opts)"),
        joinRoom: jasmine.createSpy("sdk.joinRoom(idOrAlias)"),
        sendMessage: jasmine.createSpy("sdk.sendMessage(roomId, content)"),
        roomState: jasmine.createSpy("sdk.roomState(roomId)"),
        setRoomTopic: jasmine.createSpy("sdk.setRoomTopic(roomId, topic)"),
        setDisplayName: jasmine.createSpy("sdk.setDisplayName(name)"),
        getStateEvent: jasmine.createSpy("sdk.getStateEvent(room,type,key)"),
        invite: jasmine.createSpy("sdk.invite(roomId, userId)"),
        leave: jasmine.createSpy("sdk.leave(roomId)")
    };

    // mock up getStateEvent immediately since it is called for every new IRC
    // connection.
    mockClient.getStateEvent.andCallFake(function() {
        return q({});
    });

    // Helper to succeed sdk registration calls.
    mockClient._onHttpRegister = function(params) {
        mockClient.register.andCallFake(function(loginType, data) {
            expect(loginType).toEqual("m.login.application_service");
            expect(data).toEqual({
                user: params.expectLocalpart
            });
            return q({
                user_id: params.returnUserId
            });
        });
        mockClient.setDisplayName.andCallFake(function(name) {
            if (params.andResolve) {
                params.andResolve.resolve();
            }
            return q({});
        });
    };
};
