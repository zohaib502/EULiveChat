!function (e, t, n, r) {
    function s() { try { var e; if ((e = "string" == typeof this.response ? JSON.parse(this.response) : this.response).url) { var n = t.getElementsByTagName("script")[0], r = t.createElement("script"); r.async = !0, r.src = e.url, n.parentNode.insertBefore(r, n) } } catch (e) { } } var o, p, a, i = [], c = []; e[n] = { init: function () { o = arguments; var e = { then: function (t) { return c.push({ type: "t", next: t }), e }, catch: function (t) { return c.push({ type: "c", next: t }), e } }; return e }, on: function () { i.push(arguments) }, render: function () { p = arguments }, destroy: function () { a = arguments } }, e.__onWebMessengerHostReady__ = function (t) { if (delete e.__onWebMessengerHostReady__, e[n] = t, o) for (var r = t.init.apply(t, o), s = 0; s < c.length; s++) { var u = c[s]; r = "t" === u.type ? r.then(u.next) : r.catch(u.next) } p && t.render.apply(t, p), a && t.destroy.apply(t, a); for (s = 0; s < i.length; s++)t.on.apply(t, i[s]) }; var u = new XMLHttpRequest; u.addEventListener("load", s), u.open("GET", r + "/loader.json", !0), u.responseType = "json", u.send()
}(window, document, "Bots", "/Lib/ChatBot/bots-client-sdk-js");

var agentAvailable = false;
var agentIconUrl = "/Lib/ChatBot/images/livechat-avatar.svg";
var botIconUrl = "/Lib/ChatBot/images/Bot_Avatar.svg";
var token = 'noToken';
var sessionId = 'noSessionId';
var accountNumber = 'noAccountNumber';
var email = 'noemail@test.com';
var customerName = 'noCustomerName';
var absoluteUrl = window.location.href;
var envirornmentUrl = Exelon.Web.Configuration.OpCoConfigurationObject.SecureURLBase;

console.log("chatbot feedback" + Exelon.Web.Configuration.OpCoConfigurationObject.ChatBotFeedbackBaseUrl + Exelon.Web.Configuration.OpCoConfigurationObject.ChatBotFeedbackSubscriptionKey);

function initbots() {
    var messageBody = {
        text: 'Hi',
        type: 'text',
        metadata: {
            isHidden: true
        }
    };
    return Bots.init({
        appId: Exelon.Web.Configuration.OpCoConfigurationObject.ChatBotAppId, //tst appid
        // appId: '5e27729ecba73500102d726b', //dev appid
        displayStyle: 'button',
        buttonIconUrl: '/Lib/ChatBot/images/chat-launch.svg',
        buttonWidth: '58px',
        buttonHeight: '58px',
        menuItems: {
            imageUpload: false,
            fileUpload: false,
            shareLocation: false
        },

        customText: {
            fetchingHistory: 'Retrieving history...'
        }
    }).then(function (res) {
        Bots.updateUser(
            {
                "givenName": customerName.split(" ")[0],
                "surname": customerName.split(" ")[1],
                "email": email,
                "properties": {
                    "smoochCustomVariable1": sessionId,
                    "smoochCustomVariable2": token,
                    "smoochCustomVariable3": accountNumber,
                    "smoochCustomVariable4": absoluteUrl,
                    "smoochCustomVariable5": envirornmentUrl,
                    "smoochCustomVariable6": Exelon.Web.Configuration.OpCoConfigurationObject.OracleMobileBackendID,
                    "smoochCustomVariable7": Exelon.Web.Configuration.OpCoConfigurationObject.AnonOAuthKey,
                    "smoochCustomVariable8": Exelon.Web.Configuration.OpCoConfigurationObject.McsVersion.auth,
                    "smoochCustomVariable9": Exelon.Web.Configuration.OpCoConfigurationObject.McsVersion.anon,
                    "smoochCustomVariable10": Exelon.Web.Configuration.OpCoConfigurationObject.ChatBotFeedbackBaseUrl,
                    "smoochCustomVariable11": Exelon.Web.Configuration.OpCoConfigurationObject.ChatBotFeedbackSubscriptionKey

                }
            })
        Bots.on('widget:opened', function () {
            if (Bots.getConversation().messages != null && Bots.getConversation().messages.length < 1) {
                Bots.setDelegate({

                    beforeDisplay: function (messageBody) {  // Updated by Zohaib 
                        if (messageBody.metadata && messageBody.metadata.isHidden) {
                            return null;
                        }
                        return messageBody;
                    }
                });
                Bots.sendMessage(messageBody);
            }
        })

        Bots.on('message', function (message) {
            Bots.setDelegate({
                beforeDisplay: function (message) {
                    var shouldDisplay = false;

                    try {
                        shouldDisplay = message.metadata.isHidden;
                        return null;
                    } catch (error) {

                        if (message.text.includes('Ask ComEd')) {
                            var displayText = message.text.replace('Ask ComEd', '');
                            message.text = displayText;
                            return message;
                        } else if (message.text.toLowerCase().includes('agent rejected')) { // replacing "Agent rejected" message"
                            var displayText = message.text.toLowerCase().replace('agent rejected', "Live chat with a ComEd team member is available Monday - Friday, 9 a.m. - 5 p.m., excluding holidays. For live help outside these hours, you can call ComEd's Customer Service at 1-800-EDISON-1 (1-800-334-7661).");
                            message.text = displayText;
                            return message;
                        } else {
                            return message;
                        }
                    }
                }
            });

            var messengerDocument = document.getElementById('web-messenger-container').contentDocument;
            messengerDocument.getElementById("conversation").style.visibility = "visible";

            this.setAgentAvailability(message.text);
            var imgTag = messengerDocument.querySelectorAll("[id='avatar']");
            for (var i = 0; i < imgTag.length; i++) {
                if (agentAvailable) {
                    imgTag[imgTag.length - 1].src = agentIconUrl; // Zohaib Khan: Setting the Agent icon based on Availability.
                } else {
                    imgTag[imgTag.length - 1].src = botIconUrl; // Zohaib Khan: Setting the default bot avatar if agent is not available.
                }
            }

            var cdescItems = messengerDocument.querySelectorAll('.carousel-description');
            if (cdescItems != null) {
                $.each(cdescItems, function (singleCDesc) { // Updated by Zohaib
                    singleCDesc.style = "margin: 0px 8px 13px; font-size: 13px; color: rgb(179, 179, 179); white-space: pre-wrap; flex: 2 1";
                });
            }
        });

        /* CUSTOM - END*/
    }).then(customUI);

}

function clearChat(e) {
    if (e != null) e.preventDefault(); /* CUSTOM - Added if(e != null) */
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i] === 'appId') {
            continue;
        }
        localStorage.removeItem(keys[i]);
    }
}
/*-------------------------------------------------------------------------------------------------------------------------------------------*/

function sendMessage(t) {
    Bots.sendMessage(t);
}

function powerLine() {

    Bots.sendMessage('Ask ComEd Downed Power Line');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}

function outage() {
    Bots.sendMessage('Ask ComEd Power Outage');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}

function billing() {
    Bots.sendMessage('Ask ComEd Billing and Payment');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}

function findAccountNumber() {
    Bots.sendMessage('Ask ComEd Find Account Number');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}

function startStop() {
    Bots.sendMessage('Ask ComEd Start, Stop or Move Service');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}

function recycling() {
    Bots.sendMessage('Ask ComEd Ways to Save');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}

function moreMenu() {
    Bots.sendMessage('Ask ComEd More');
    document.getElementById('web-messenger-container').contentDocument.getElementById("menu-items").style.display = "none";
}


function enableComments(comments) {
    comments.style.display = 'inline'
}


function Close() {
    var messengerDocument = document.getElementById('web-messenger-container').contentDocument;
    messengerDocument.getElementById("prompt").style.display = "inline";
    messengerDocument.getElementById("conversation").style.opacity = "0.2";
    messengerDocument.getElementById("footer").style.opacity = "0.2";
    messengerDocument.getElementById("headerEl").style.opacity = "0.2";
    messengerDocument.getElementById("conversation").style.pointerEvents = "none";
    messengerDocument.getElementById("footer").style.pointerEvents = "none";
    messengerDocument.getElementById("headerEl").style.pointerEvents = "none";
}

function CloseYes() {
    var isIE = false || !!document.documentMode;
    Bots.destroy();
    clearChat();
    agentAvailable = false;
    showChatButton();
    if (isIE) {
        location.reload(true);
    }
}


function CloseNo() {
    var messengerDocument = document.getElementById('web-messenger-container').contentDocument;
    messengerDocument.getElementById("prompt").style.display = "none";
    messengerDocument.getElementById("conversation").style.opacity = "1";
    messengerDocument.getElementById("footer").style.opacity = "1";
    messengerDocument.getElementById("headerEl").style.opacity = "1";
    messengerDocument.getElementById("conversation").style.pointerEvents = "all";
    messengerDocument.getElementById("footer").style.pointerEvents = "all";
    messengerDocument.getElementById("headerEl").style.pointerEvents = "all";
}

function minimize() {
    Bots.close();
}

function menuItems() {
    var messengerDocument = document.getElementById('web-messenger-container').contentDocument;
    var k = messengerDocument.getElementById("menu-items").style.display = "block";
}

function menuMouseOut() {
    var messengerDocument = document.getElementById('web-messenger-container').contentDocument;
    var k = messengerDocument.getElementById("menu-items");
    k.style.display = "none"
}

// to get the url paramters
function getUrlData() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });

    return vars["bot"];
}



function showChatButton() {
    var request = new XMLHttpRequest();
    request.open('GET', Exelon.Web.Configuration.OpCoConfigurationObject.SecureURLBase + '/api/services/myaccountservice.svc/getsession', true);
    request.withCredentials = true;
    request.onload = function (e) {
        if (request.readyState === 4) {
            if (request.status === 200) {
                obj = JSON.parse(request.responseText);

                if (obj.token != null) {
                    token = obj.token;
                }

                if (obj.id != null) {
                    sessionId = obj.id;
                }

                if (obj.accountNumber != null) {
                    accountNumber = obj.accountNumber;
                }

                if (obj.primaryEmail != null) {
                    email = obj.primaryEmail;
                }

                if (obj.customerName != null) {
                    customerName = obj.customerName;
                }
                console.log('Show Bot');
                clearChat();
                if (window.sessionStorage.getItem('chatEnabled') === null) {
                    clearChat();
                }

                Bots.destroy();
                initbots()
                    .then(function () {
                        console.log("init complete");
                        window.sessionStorage.setItem('chatEnabled', 'true');
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            } else {
                console.error(request.statusText);
            }
        }
    };
    request.send(null);



}

function sendEmail() {
    Bots.sendMessage('Ask ComEd Send an Email');
    var messengerDocument = document.getElementById('pdfLoader');
}

//icon change for the Live Chat intent
function setAgentAvailability(fromMessage) {
    var agentAvailableText = "Your chat session is being transferred from ComEd’s automated assistant to one of our team members, who will be with you shortly.<br>If you would like to return to the chatbot, type leave queue.";
    var agentLeftText = "Welcome back to ComEd's automated assistant! To chat more, click the Menu above to see the topics I can help with, or just type in your question. If you're finished chatting, please choose one of the options below to end your chat.";

    if (fromMessage == agentAvailableText) {
        agentAvailable = true;
    }
    if (fromMessage == agentLeftText) {
        agentAvailable = false;
    }
}

function downloadPDF(bdate) {

    var request = new XMLHttpRequest();
    request.open('GET', Exelon.Web.Configuration.OpCoConfigurationObject.SecureURLBase + '/.mcs/mobile/custom/auth' + Exelon.Web.Configuration.OpCoConfigurationObject.McsVersion.auth + '/accounts/' + accountNumber + '/billing/' + bdate + '/pdf', true);
    request.withCredentials = true;
    request.setRequestHeader("Authorization", 'Bearer ' + token);
    request.setRequestHeader("oracle-mobile-backend-id", Exelon.Web.Configuration.OpCoConfigurationObject.OracleMobileBackendID);
    request.setRequestHeader("Content-Type", "application/json");



    request.onload = function (e) {
        if (request.readyState === 4) {
            if (request.status === 200) {

                content = JSON.parse(request.responseText);

                if (content.success) {
                    var linkSource = "data:application/pdf;base64," + content.data.billImageData;
                    var fileName = "BillImage.pdf";
                    let isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
                        !window.MSStream;
                    if (isIOS) {
                        openTab(linkSource);
                    } else if (document.documentMode || /Edge/.test(navigator.userAgent)) {
                        var byteCharacters = window.atob(content.data.billImageData);
                        var byteNumbers = new Array(byteCharacters.length);
                        for (var i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        var byteArray = new Uint8Array(byteNumbers);
                        var blob = new Blob([byteArray], { type: 'application/pdf' });
                        //window.navigator.msSaveOrOpenBlob(blob, fileName); 
                        window.navigator.msSaveBlob(blob, fileName);
                    } else {
                        var downloadLink = document.createElement("a");
                        downloadLink.href = linkSource;
                        downloadLink.download = fileName;
                        downloadLink.click();
                    }

                } else {
                    console.log("Server not responding");
                }

            } else {
                console.error(request.statusText);
            }
        }
    };
    request.send(null);
}

function openTab(url) {
    // Create link in memory
    var a = window.document.createElement("a");
    a.target = '_blank';
    a.href = url;

    // Dispatch fake click
    var e = window.document.createEvent("MouseEvents");
    e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
};

function customUI() {
    // access messenger iframe document element
    var messengerDocument = document.getElementById('web-messenger-container').contentDocument;

    // Add the custom CSS to the message container frame.
    messengerDocument.head.innerHTML += "\n<link rel='stylesheet' href='/Lib/ChatBot/styles/chatbot.css' type='text/css'></link>\n";
    messengerDocument.head.innerHTML += "\n<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.css' type='text/css'></link>\n";
    var headerElement = messengerDocument.getElementById('header');
    var introElement = messengerDocument.querySelector('.intro-pane');

    // Hide the Introductio Header.
    introElement.style.display = 'none';
    headerElement.innerText = '';

    //our customized header
    headerElement.insertAdjacentHTML("afterend", "<div id='headerEl' class='header-wrapper' style='background-color: #FFFFFF;'><div class='app-name'><span>Let's Chat!</span><a onmouseover='javascript:window.parent.menuItems();' onmouseout='javascript:window.parent.menuMouseOut();' class='menu-icon'>Menu</a></div><div><div id='min' class='close-handle close-hidden'><a href='javascript:window.parent.minimize();'><i class='fa fa-minus'></i></a>&emsp;<a href='javascript:window.parent.Close();'><i class='fa fa-times'></i></a></div></div></div>")
    // window.parent.currentSlide(1);
    headerElement.insertAdjacentHTML("afterend", "<div id='prompt'>Do you want to end the conversation?<br>This will clear your chat history.<div class='prompt-btn-sec'><a class='btn btn-primary prompt-btn-outline' style='border-color: rgb(0, 153, 255); background-color: rgb(0, 153, 255);' href='javascript:window.parent.CloseNo();'>No</a><a class='btn btn-primary prompt-btn-fill' style='border-color: rgb(0, 153, 255); background-color: rgb(0, 153, 255);' href='javascript:window.parent.CloseYes();'>Yes</a></div>");
    //The sample demo shipped with the Web SDK (app.js) can be modified to include this
    headerElement.insertAdjacentHTML("afterend", "<div id='menu-items' onmouseover='javascript:window.parent.menuItems();'  onmouseout='javascript:window.parent.menuMouseOut();'><ul><li><a>I can help you with:</a></li><li><a  href='javascript:window.parent.billing();'>Billing and Payment</a></li><li><a  href='javascript:window.parent.outage();'>Power Outage</a></li><li><a href='javascript:window.parent.powerLine();'>Downed Power Line</a></li><li><a href='javascript:window.parent.findAccountNumber();'>Find Account Number</a></li><li><a  href='javascript:window.parent.startStop();'>Start, Stop or Move Service</a></li><li><a href='javascript:window.parent.recycling();'>Ways to Save</a></li><li><a href='javascript:window.parent.moreMenu();'>More</a></li></ul></div>")

}