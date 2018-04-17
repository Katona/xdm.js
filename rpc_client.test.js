import test from 'ava';
import {RpcClientHandler} from './rpc_client'
import sinon from 'sinon';

class ConsoleMessagingBackend {

    constructor() {
        this.callbacks = []
    }
    sendMessage(msg) {
        this.callbackId = msg.args.find(arg => arg.type === 'function').id;
        console.log(JSON.stringify(msg));
    }
    onResponse(callback) { 
        console.log(callback);
        this.callbacks.push(callback);
    }

    emitOnResponse(arg) {
        console.log('emitting onResponse');
        this.callbacks.forEach(c => c(arg));
    }
}


// GET /
// api.get()
// // GET /users
// api.getUsers()
// // GET /users/1234/likes
// api.getUsers$Likes('1234')
// // GET /users/1234/likes?page=2
// api.getUsers$Likes('1234', { page: 2 })
// // POST /items with body
// api.postItems({ name: 'Item name' })
// // api.foobar is not a function
// api.foobar()

test('should register a response listener for callbacks', t => {
	const testBackend = {
		sendMessage: sinon.stub(),
		onResponse: sinon.stub()
	}
	const api = new Proxy({}, new RpcClientHandler(testBackend));
	t.is(testBackend.onResponse.firstCall.args.length, 1);
});

test('should handle callbacks.', t => {
	const testBackend = {
		sendMessage: sinon.stub(),
		onResponse: sinon.stub()
	}
	const client = new Proxy({}, new RpcClientHandler(testBackend));
	t.is(testBackend.onResponse.firstCall.args.length, 1);
	// Grab the response listener which is registered on the messaging backend
	const callbackResponseListener = testBackend.onResponse.firstCall.args[0];
	const testCallback = sinon.stub();
	// Register a callback
	client.on('test', testCallback);
	// Check registration message
	t.is(testBackend.sendMessage.firstCall.args.length, 1);
	const cbRegistrationMessage = testBackend.sendMessage.firstCall.args[0];
	t.is(cbRegistrationMessage.type, 'CALLBACK_REGISTRATION');
	t.is(cbRegistrationMessage.args.length, 2);
	t.is(cbRegistrationMessage.args[0].type, 'string')
	t.is(cbRegistrationMessage.args[1].type, 'function')
	const callbackArgument = cbRegistrationMessage.args[1];
	// Trigger a callback response
	callbackResponseListener({ type: 'CALLBACK', id: callbackArgument.id, args: ['firstArg', 'secondArg'] });
	t.is(testCallback.callCount, 1);
	t.deepEqual(testCallback.firstCall.args, ['firstArg', 'secondArg']);

	// Deregister callback
	client.off('test', testCallback);
	// Check message
	t.is(testBackend.sendMessage.callCount, 2);
	const cbDeregistrationMessage = testBackend.sendMessage.secondCall.args[0];
	t.is(cbDeregistrationMessage.type, 'CALLBACK_DEREGISTRATION');
	t.is(cbDeregistrationMessage.args.length, 2);
	t.is(cbDeregistrationMessage.args[0].type, 'string')
	t.is(cbDeregistrationMessage.args[1].type, 'function')

	callbackResponseListener({ type: 'CALLBACK', id: cbDeregistrationMessage.args[1].id, args: ['firstArg']});
	t.is(testCallback.callCount, 1, 'Callback should have not been invoked since it has been deregistered.');
});