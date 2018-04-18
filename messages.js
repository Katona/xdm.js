let uuid = require('uuid');

function createFunctionCallMessage(functionName, args) {
    const argDescriptors = args.map(arg => 
        ({
            type: typeof arg,
            value: arg
        })
    );
    return {
        type: 'FUNCTION_CALL',
        id: uuid.v4(),
        functionName,
        args: argDescriptors,
    }
}

function createCallbackRegistrationMessage(functionName, callbackId, args) {
    const argDescriptors = args.map(arg => {
        if (typeof arg === 'function') {
            return {
                type: typeof arg,
                id: callbackId
            };
        } else {
            return {
                type: typeof arg,
                value: arg
            };
        }
    });
    let msg = {
        type: 'CALLBACK_REGISTRATION',
        id: uuid.v4(),
        functionName,
        args: argDescriptors,
    }
    return msg
}

function createCallbackDeregistrationMessage(functionName, callbackId, args) {
    const argDescriptors = args.map(arg => {
        if (typeof arg === 'function') {
            return {
                type: typeof arg,
                id: callbackId
            };
        } else {
            return {
                type: typeof arg,
                value: arg
            };
        }
    });
    let msg = {
        type: 'CALLBACK_DEREGISTRATION',
        id: uuid.v4(),
        functionName,
        args: argDescriptors,
    }
    return msg;
}

module.exports.createFunctionCallMessage = createFunctionCallMessage
module.exports.createCallbackRegistrationMessage = createCallbackRegistrationMessage
module.exports.createCallbackDeregistrationMessage = createCallbackDeregistrationMessage