async function elsponsorLoad() {
  let kind = 'Impression';
  let details = {};

  try {
    const origin = window.location.origin;
    const origins = ["https://*.draftxr.com","http://localhost:3000"];
    const isAllowedOrigin = origins.some((hostname) => {
      if (hostname === 'https://*' || hostname === 'http://*') {
        console.debug('any', hostname);
        return true;
      } else if (hostname.startsWith('https://*.')) {
        const subdomain = hostname.slice(10);
        console.debug('secure subdomain', origin.endsWith(subdomain) || origin === subdomain)
        return origin.endsWith(subdomain) || origin === subdomain;
      } else if (hostname.startsWith('http://*.')) {
        const subdomain = hostname.slice(9);
        console.debug('subdomain', subdomain, origin.endsWith(subdomain) || origin === subdomain)
        return origin.endsWith(subdomain) || origin === subdomain;
      } else {
        console.debug('exact', hostname, origin === hostname)
        return origin === hostname;
      }
    });

    if (!isAllowedOrigin) {
      console.warn(`Elsponsor installed and is disabled for ${origin}. Allowed origins:`, origins);
      expireCookie("elsponsor-create-placement");
    } else {
      details['location'] = normalizeLocation(window.location);
      console.info('location added');

      for (const key in navigator) {
        try {
          const type = typeof navigator[key];
          if (['string', 'boolean', 'number'].includes(type)) {
            details[key] = navigator[key];
            console.info(`${key} added`);
          } else {
            console.debug(`${key} ignored because it is not serializable`);
          }
        } catch (e) {}
      }
        
      console.log('Elsponsor impression', origin, details);
    }
  } catch (error) {
    kind = 'Error';
    details = { error }; 
  }

  const placements = [];

  const activePlacements = placements.filter((placement) => {
    console.debug('active', matchLocation(placement.location, details['location']), document.querySelector(placement.path))
    return placement.status === 'Active' && matchLocation(placement.location, details['location']) && document.querySelector(placement.path)
  });

  activePlacements.map((placement) => {
    const where = document.querySelector(placement.path);
    console.info('run', where, rebuild(JSON.parse(placement.template)), placement.template)
    where.parentNode.insertBefore(rebuild(JSON.parse(placement.template)), where.nextSibling);
  });

  await fetch('https://www.elsponsor.com/api', {
    method: 'POST',
    priority: 'low',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation CreateEvent($data: EventCreateInput!) {
          createOneEvent(data: $data) {
            id
          }
        }
      `,
      variables: {
        data: {
          occurredAt: new Date().toISOString(),
          zone: {
            connect: {
              id: "61b31d84-4028-4e55-b45e-a9017945bfe2"
            }
          },
          details: JSON.stringify(details)
        }
      },
    }),
  });
}

function matchLocation(pattern, location) {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '[^/]*')}$`);
  return regex.test(location);
}

function normalizeLocation(location) {
  let searchParams = new URLSearchParams(location.search);
  let queryParams = new URLSearchParams(location.hash.slice(1));

  searchParams = new URLSearchParams([...searchParams.entries()].sort());
  queryParams = new URLSearchParams([...queryParams.entries()].sort());

  let normalized = location.origin + location.pathname;

  if (searchParams.toString()) {
    normalized += "#" + searchParams.toString();
  }

  if (queryParams.toString()) {
    normalized += "?" + queryParams.toString();
  }

  return normalized;
}

function rebuild(serializedNode) {
  if (serializedNode.type === 'element') {
    const element = document.createElement(serializedNode.tagName);

    for (let i = 0; i < serializedNode.attributes.length; i++) {
      const attribute = serializedNode.attributes[i];
      element.setAttribute(attribute.name,  attribute.value);
    }

    for (const [name, value] of Object.entries(serializedNode.attributes)) {
      if (name === 'style') {
        Object.assign(element.style, value);           
      } else {
        element.setAttribute(name, value);
      }
    }

    element.setAttribute('data-snapshot-id', serializedNode.id);

    for (const child of serializedNode.childNodes) {
      element.appendChild(rebuild(child));
    }

    return element;
  } else if (serializedNode.type === 'text') {
    return document.createTextNode(serializedNode.textContent);
  } else if (serializedNode.type === 'cdata') {
    return document.createCDATASection(serializedNode.textContent);
  } else if (serializedNode.type === 'comment') {
    return document.createComment(serializedNode.textContent);
  }
}

elsponsorLoad();

if (document.cookie.indexOf("elsponsor-create-placement") !== -1) {
  console.log('Create placement');
  let div = null;

  document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      console.log('Close elsponsor');

      expireCookie("elsponsor-create-placement");

      if (div) {
        div.remove();
        div = null;
      }
    }
  });
  
  function expireCookie(name) {
    setCookie(name, "", -1);
  }
  
  function setCookie(name, value, days) {
    let expires = "";

    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  function getPath(element) {
    if (element.tagName === 'HTML') return 'html';
    if (element === document.body) return 'body';
  
    let selector = element.tagName.toLowerCase();
  
    if (element.id) {
      selector += `#${element.id}`;
    } else {
      var ix = 0;
      var siblings = element.parentNode.childNodes;
      for (var i = 0; i < siblings.length; i++) {
        var sibling = siblings[i];
        if (sibling === element) selector += `:nth-of-type(${ix + 1})`;
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
      }
    }
  
    if (element.className) {
      selector += `.${element.className.split(' ').join('.')}`;
    }
  
    const testId = element.getAttribute('data-testid');
  
    if (testId) {
      selector += `[data-testid="${testId}"]`;
    }
  
    return `${getPath(element.parentNode)} > ${selector}`;
  }

  function getElementId(element) {
    let key = '';

    if (element.id) {
      key += `-${element.id.replace(/[^a-z0-9]/gi, '')}`;
    }

    if (element.classList.length > 0) {
      key += `-${Array.from(element.classList)
        .join('-')
        .replace(/[^a-z0-9]/gi, '')}`;
    }

    return key;
  };

  const IGNORE_COMPUTED_LAYOUT = ['height', 'width', 'block-size', 'inline-size'];
  const shadowHost = document.body.appendChild(document.createElement('div'));
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  const rootStyles = {
    getPropertyValue() { return ""; }
  };

  let nextId = 0;
  function snapshot(element, shadowRoot) {
    const variables = {};
    const serializedElement = {
      type: 'element',
      tagName: element.tagName.toLowerCase(),
      attributes: {},
      childNodes: [],
    };
  
    for (let i = 0; i < element.attributes.length; i++) {
      const attribute = element.attributes[i];
      serializedElement.attributes[attribute.name] = attribute.value;
    }
  
    const inlineStyle = {};
    const tempEl = shadowHost.appendChild(document.createElement(element.tagName));
    const defaultComputedStyles = getComputedStyle(tempEl);

    for (let i = 0; i < element.style.length; i++) {
      const property = element.style[i];
      const value = element.style.getPropertyValue(property);
      console.debug('added inline style', property, value);
      inlineStyle[property] = value;
    }

    const computedStyles = getComputedStyle(element);
    const parentComputedStyles = element.parentNode === shadowRoot
      ? rootStyles
      : getComputedStyle(element.parentNode);

    for (let i = 0; i < computedStyles.length; i++) {
      const property = computedStyles[i];
      const value = computedStyles.getPropertyValue(property);
      const defaultValue = defaultComputedStyles.getPropertyValue(property);

      if (value !== defaultValue && !element.style[property] && value !== parentComputedStyles.getPropertyValue(property) && !IGNORE_COMPUTED_LAYOUT.includes(property)) {
        console.debug('added computed style', property, value, 'default:', defaultValue, defaultComputedStyles);
        inlineStyle[property] = value;
      }
    }

    tempEl.remove();

    if (!Object.keys(inlineStyle).length) {
      console.warn('no styles', element);
    }

    console.debug('style', inlineStyle, element);
    serializedElement.attributes.style = inlineStyle;

    if (element.nodeType === Node.TEXT_NODE) {
      serializedElement.id = getElementId(element) || "text" + nextId++;
      variables[serializedElement.id] = element.textContent;
    } else if (element instanceof HTMLImageElement) {
      serializedElement.id = getElementId(element) || "image" + nextId++;
      variables[serializedElement.id] = element.getAttribute('src');
    } else if (element instanceof HTMLAnchorElement) {
      serializedElement.id = getElementId(element) || "link" + nextId++;
      variables[serializedElement.id] = element.getAttribute('href');
    } else {
      serializedElement.id = nextId++;
    }

    const childNodes = element.shadowRoot
      ? element.shadowRoot.childNodes // Pierce shadow dom
      : element.childNodes;

    for (const child of childNodes) {
      if (child instanceof Element) {
        const { template, variables: childVariables } = snapshot(child, element.shadowRoot);
        serializedElement.childNodes.push(template);
        Object.assign(variables, childVariables);
      } else if (child.nodeType === Node.TEXT_NODE) {      
        serializedElement.id = getElementId(child.parentNode) || "text" + nextId++;
        serializedElement.childNodes.push({
          type: 'text',
          textContent: child.textContent
        });

        variables[serializedElement.id] = child.textContent;
      } else if (child instanceof CDATASection) {
        serializedElement.childNodes.push({
          type: 'cdata',
          textContent: ''
        });
      } else if (child instanceof Comment) {
        serializedElement.childNodes.push({
          type: 'comment',
          textContent: child.textContent
        });
      }
    }
  
    return {
      template: serializedElement,
      variables
    };
  }

  document.addEventListener("click", async (event) => {
    console.log('click', event.target, div);

    if (div) {
      let siblingsSameType = !!event.target.nextSibling;
      let currentSibling = event.target.nextSibling;

      while (currentSibling) {
        if (currentSibling.tagName !== event.target.tagName) {
          siblingsSameType = false;
          break;
        }

        currentSibling = currentSibling.nextSibling;
      }

      console.log(siblingsSameType ? 'Show list placement' : 'Show placement', getPath(event.target));
      const { template, variables } = snapshot(event.target);
      const preview = rebuild(template); // verify rebuild
      const shadowHost = document.createElement('div');
      const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
      event.target.parentNode.insertBefore(shadowHost, event.target.nextSibling);
      shadowRoot.appendChild(preview);

      await fetch('https://www.elsponsor.com/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreatePlacement($data: PlacementCreateInput!) {
              createOnePlacement(data: $data) {
                id
              }
            }
          `,
          variables: {
            data: {
              owner: "CURRENT_USER",
              zone: {
                connect: {
                  id: "61b31d84-4028-4e55-b45e-a9017945bfe2"
                }
              },
              location: normalizeLocation(window.location),
              path: getPath(event.target),
              template: JSON.stringify(template),
              variables: JSON.stringify(variables),
            }
          },
        })
      });

      expireCookie("elsponsor-create-placement");
      // window.close();
    }
  });

  document.addEventListener("mouseover", (event) => {
    // console.debug('over', event.target, div);
  
    if (!div) {
      div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.backgroundColor = 'blue';
      div.style.opacity = '0.3';
      div.style.pointerEvents = 'none';
      div.inert = true;
    }
  
    const bounds = event.target.getBoundingClientRect();
    div.style.left = bounds.left + 'px';
    div.style.top = bounds.top + 'px';
    div.style.width = bounds.width + 'px';
    div.style.height = bounds.height + 'px';
    document.body.appendChild(div);
  });
  
  document.body.addEventListener("mouseleave", (event) => {
    if (div) {
      div.remove();
      div = null;
    }
  });
}