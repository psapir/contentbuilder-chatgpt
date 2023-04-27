var chatgptResults = [];
var promptVar,variationsVar,tagVar;

$(function(){
    var sdk = new SDK();
    $('#btn-generate').on("click",function(event){
        
        event.preventDefault();

        $('#pnl-results').hide();

        promptVar = $('#txt-prompt').val();
        variationsVar = $('#txt-variations').val();
        tagVar = $('#txt-tag').val();

        $.ajax({
            url: '/chatgpt/getResults',
            method: 'POST',
            data:{
                prompt :'Write an alternative for this text: '+ promptVar,
                variations : variationsVar
            },
            success(results){
                chatgptResults = [];
                results.choices.forEach(choice => {
                    var resultText = choice.text.replace('"','');
                    $('#lst-results').append('<li>' + resultText + '</li>');
                    chatgptResults.push(resultText);
                    $('#pnl-results').show();
                });
            }
        });
        
    });

    $('#btn-use-results').on("click",function(event){
        event.preventDefault();

        sdk.setData({
            prompt:  promptVar,
            results : chatgptResults,
            variations : variationsVar,
            tag : tagVar
        });

        var contentBlockContent = '<script runat=server> \
            Platform.Load("Core","1"); \
            try{ \
                    \
                    var generatedContentRows = ['+generateResultsArray()+']; \
                    var variation = Math.floor(Math.random() * '+ variationsVar +'); \
                    var text = generatedContentRows[variation]; \
                    Variable.SetValue("@generatedContent", text); \
                    Variable.SetValue("@generatedContentAlias", "'+ tagVar +'" + "-" + (variation+1)); \
                    } \
                catch(e){ \
                Variable.SetValue("@generatedContent","' +promptVar+'"); \
                Variable.SetValue("@generatedContentAlias",'+ tagVar + '"-default"); \
                } \
        </script> \
        %%=v(generatedContent)=%%';
        
        sdk.setContent(contentBlockContent);

    });

})

function generateResultsArray(){
    var textArray = '';
    for (let index = 0; index < chatgptResults.length; index++) {
        textArray += '"'+chatgptResults[index]+'"';
        if(index < chatgptResults.length - 1)
            textArray += ',';
    }
    return textArray;
}