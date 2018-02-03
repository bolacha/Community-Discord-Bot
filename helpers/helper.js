module.exports.splitter = (message) => {
    const message_array   = message.content.split(' ');
    const cmd             = message_array[0];
    const args            = message_array.slice(1);

    return {
        cmd,
        args
    };
}
