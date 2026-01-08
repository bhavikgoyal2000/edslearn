function loadScript(src, widValue) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.id = 'a5widget';
    script.setAttribute('data-widget_code_id', widValue);
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadDOMforChatWidget(chatChannelUrl) {
  const outerDiv = document.createElement('div');
  outerDiv.classList.add('a5-widget-wrapper', 'a5-widget-as-card', 'a5-show', 'a5-widget-inited');

  const widgetDiv = document.createElement('div');
  widgetDiv.id = 'a5-widget';
  widgetDiv.style.display = 'block';
  widgetDiv.className = 'a5-widget a5-widget-card a5-ease-in-out-sine a5-icon-responsive';
  widgetDiv.setAttribute('data-url', chatChannelUrl);

  // Dismiss button
  const dismissDiv = document.createElement('div');
  dismissDiv.setAttribute('role', 'button');
  dismissDiv.tabIndex = 0;
  dismissDiv.id = 'a5-dismiss';
  dismissDiv.className = 'a5-dismiss';
  dismissDiv.title = 'Close widget';
  dismissDiv.style.fill = 'rgb(204, 204, 204)';

  const iconCloseDiv = document.createElement('div');
  iconCloseDiv.className = 'a5-widget-icon-html-close';

  const iPath1 = document.createElement('i');
  iPath1.className = 'path1';
  iPath1.style.backgroundColor = 'rgb(204, 204, 204)';
  const iPath2 = document.createElement('i');
  iPath2.className = 'path2';
  iPath2.style.backgroundColor = 'rgb(204, 204, 204)';

  iconCloseDiv.appendChild(iPath1);
  iconCloseDiv.appendChild(iPath2);
  dismissDiv.appendChild(iconCloseDiv);

  // Widget icon image
  const img = document.createElement('img');
  img.id = 'a5-icon';
  img.setAttribute('role', 'button');
  img.tabIndex = 0;
  img.title = 'Open widget';
  img.setAttribute('aria-label', 'Open widget');
  img.className = 'a5-icon a5-custom-icon a5-ease-in-out-sine a5-duration-1 a5-img';
  img.style.backgroundColor = 'transparent';
  img.src = 'https://files.alive5.com/images/widgets/upload/americanunviersity-w1698416694797.png';
  img.alt = 'Chat widget';

  // Widget iframe
  const iframe = document.createElement('iframe');
  iframe.src = chatChannelUrl;
  iframe.className = 'a5-widget-iframe a5-ease-in-out-sine';
  iframe.frameBorder = '0';
  iframe.scrolling = 'no';
  iframe.id = 'a5-widget-iframe';
  iframe.title = 'Alive5 chat window';
  iframe.setAttribute('aria-atomic', 'true');
  iframe.setAttribute('aria-live', 'assertive');
  iframe.style.visibility = 'visible';

  // Append all to widgetDiv
  widgetDiv.appendChild(dismissDiv);
  widgetDiv.appendChild(img);
  widgetDiv.appendChild(iframe);

  // Unread indicator
  const unreadSpan = document.createElement('span');
  unreadSpan.className = 'a5-unread-indicator a5-has-unreads';
  unreadSpan.title = 'You have 2 unread message(s)';
  unreadSpan.textContent = '2';

  // Append to outerDiv
  outerDiv.appendChild(widgetDiv);
  outerDiv.appendChild(unreadSpan);
  return outerDiv;
}

export default async function decorate(block) {
  // Remove unused variable 'buttonLinkStyleObj'
  const [chatChannelObj, linkTypeObj, buttonLinkStyleObj,
    toutLinkStyleObj, chatSuffixObj] = Array.from(block.children).slice(1);
  const chatChannel = chatChannelObj ? chatChannelObj.textContent.trim() : '';
  const chatSuffix = chatSuffixObj ? chatSuffixObj.textContent.trim() : '';
  const linkType = linkTypeObj ? linkTypeObj.textContent.trim() : '';
  const buttonLinkStyle = buttonLinkStyleObj ? buttonLinkStyleObj.textContent.trim() : '';
  const toutLinkStyle = toutLinkStyleObj ? toutLinkStyleObj.textContent.trim() : '';

  const chatChannelMap = {
    SOE: 'https://alive5.com/chat_window_wrap.html?wid=4387c7ed-ae2d-4606-b022-04d9ae2ab50c&thread_crm_id=ae27db13-57f4-3a27-e335-c886f61667eb|cb0f60cf-2c4e-a105-85a0-05b2310cd40f',
    CAS: 'https://alive5.com/chat_window_wrap.html?wid=68f793d4-6f89-4771-8e28-e5e569accc34&thread_crm_id=44235f3d-2831-9687-2eb4-4c370c6759b8|e6082058-5f37-30e6-a514-e8ed7f0fa0b3',
    KSB: 'https://alive5.com/chat_window_wrap.html?wid=eecb2be8-4fcb-4351-b5af-d07ae4e30b6c&thread_crm_id=62150d38-b7fd-0d88-e22a-7578d731d0ee|946b8349-8a6c-4427-110f-a2a54f46a595',
    SOC: 'https://alive5.com/chat_window_wrap.html?wid=24510386-b262-4c46-84bf-a6cd760ac20c&thread_crm_id=c1453d6f-effb-97a4-0b71-8826c3478d58|2a9d9e0f-8cc7-2df1-cdc4-05b53189cb5b',
    SIS: 'https://alive5.com/chat_window_wrap.html?wid=1ebc348b-9269-42f8-8400-a0625ee88d49&thread_crm_id=2d1e6e41-57d4-64f1-9d94-c3005d043838|1ae9a0a6-e63d-d6ef-ad8a-df92ac01af85',
    SPA: 'https://alive5.com/chat_window_wrap.html?wid=699d0c60-2f67-4884-8742-21958e2be5f6&thread_crm_id=84336bab-0688-d967-08db-e408d681ef75|17959a91-2f36-0d2b-e753-2258e08d72f5',
    UC: 'https://alive5.com/chat_window_wrap.html?wid=128c369f-a6c4-4a8d-b377-55f04aa1c6f2&thread_crm_id=0177dc1a-30f9-8651-66bf-a163b311e1ee|0de0731f-a23d-5a1d-8004-17a187402b09',
    'CAS-Advising':
      'https://alive5.com/chat_window_wrap.html?wid=b3220c08-6d56-4ef4-8490-975fb2d3ceeb&thread_crm_id=c93745d5-697c-c416-a30c-a96ad0bdf802|4ae66f07-380c-7bc9-cd12-b388c33781fd',
    'it-helpdesk':
      'https://alive5.com/chat_window_wrap.html?wid=b3220c08-6d56-4ef4-8490-975fb2d3ceeb&thread_crm_id=c93745d5-697c-c416-a30c-a96ad0bdf802|4ae66f07-380c-7bc9-cd12-b388c33781fd',
  };

  const chatChannelUrl = chatChannelMap[chatChannel] || chatChannel;

  const widMatch = chatChannelUrl.match(/wid=([^&]+)&thread/);
  const widValue = widMatch ? widMatch[1] : '';

  let iconClassName = 'btn-primary';

  if (linkType === 'tout') {
    if (toutLinkStyle === 'solid-warm-blue') {
      iconClassName = 'icon-primary';
    } else if (toutLinkStyle === 'solid-teal') {
      iconClassName = 'icon-cta';
    } else if (toutLinkStyle === 'solid-taupe') {
      iconClassName = 'icon-secondary';
    } else if (toutLinkStyle === 'outline-warm-blue') {
      iconClassName = 'icon-primary-outline';
    } else if (toutLinkStyle === 'outline-teal') {
      iconClassName = 'icon-cta-outline';
    } else if (toutLinkStyle === 'outline-taupe') {
      iconClassName = 'icon-secondary-outline';
    }
  } else if (linkType === 'button') {
    if (buttonLinkStyle === 'outline') {
      iconClassName = 'btn-outline';
    }
  }

  const toutHTML = document.createRange().createContextualFragment(`
    <div class="alive-chat-wrapper">
      <div class="flex-icons-article">
        <article class="el-mini-flex-item">
          <a href="#" onclick="A5_WIDGET_ACTIONS.showWidget()" class="fact-link decor">
            <div class="flex-icon ${iconClassName}">
              <p class="flex-center">
                <span class="icon-focus">
                  <i class="ion-ios-chatboxes-outline ion-lg"></i>
                </span>
                <span class="text-below">Chat ${chatSuffix}</span>
              </p>
            </div>
          </a>
        </article>
      </div>
    </div>
    `);
  block.textContent = '';

  if (linkType === 'button') {
    const aliveChatWrapper = document.createElement('div');
    aliveChatWrapper.classList.add('alive-chat-wrapper');

    // Chat link
    const chatLink = document.createElement('a');
    chatLink.classList.add('btn', iconClassName, 'btn-alive-chat', 'snow-chat-link');
    chatLink.href = '#';
    chatLink.setAttribute('onclick', 'A5_WIDGET_ACTIONS.showWidget()');
    chatLink.innerHTML = `<i class="ion-ios-chatboxes-outline ion-lg"></i> Chat ${chatSuffix}`;
    aliveChatWrapper.appendChild(chatLink);
    block.appendChild(aliveChatWrapper);
  } else {
    block.appendChild(toutHTML);
  }

  loadScript('https://alive5.com/js/a5app.js', widValue)
    .then(() => {
      const outerDiv = document.createElement('div');
      outerDiv.classList.add('a5-widget-container');
      outerDiv.appendChild(loadDOMforChatWidget(chatChannelUrl));
      // Append to body
      const main = document.getElementById('main-container');
      if (main) {
        main.appendChild(outerDiv);
      }
    });
}
