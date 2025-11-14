/**
 * WhatsApp Bubble Widget
 * Version: 1.0.0
 */
(function() {
  console.log('[WhatsApp Bubble] Loading...');
  
  const script = document.currentScript as HTMLScriptElement;
  const websiteId = script.getAttribute('data-website-id');
  const appId = script.getAttribute('data-app-id');
  const appManagerUrl = script.getAttribute('data-app-manager-url');
  
  console.log('[WhatsApp Bubble] Config:', { websiteId, appId, appManagerUrl });
  
  if (!websiteId || !appId || !appManagerUrl) {
    console.error('[WhatsApp Bubble] Missing required attributes: data-website-id, data-app-id, or data-app-manager-url');
    return;
  }
  
  // Authorize and get configuration
  fetch(`${appManagerUrl}/api/widget/authorize?website_id=${websiteId}&app_id=${appId}`)
    .then(res => res.json())
    .then(data => {
      console.log('[WhatsApp Bubble] Authorization data:', data);
      
      if (data.authorized) {
        initWidget(data.config || {}, data.app);
      } else {
        console.error('[WhatsApp Bubble] Not authorized:', data.error);
      }
    })
    .catch(err => console.error('[WhatsApp Bubble] Authorization failed:', err));
  
  function initWidget(config: any, app: any) {
    // Get configuration with defaults
    const phoneNumber = config.phone_number;
    if (!phoneNumber) {
      console.error('[WhatsApp Bubble] phone_number is required in configuration');
      return;
    }
    
    // Validate phone number format
    if (!/^[0-9]{10,15}$/.test(phoneNumber)) {
      console.error('[WhatsApp Bubble] Invalid phone_number format. Must be 10-15 digits.');
      return;
    }
    
    const defaultMessage = config.default_message || '';
    const position = config.position || 'bottom-right';
    const enabled = config.enabled !== false;
    const bubbleSize = config.bubble_size || 60;
    const offsetX = config.offset_x || 20;
    const offsetY = config.offset_y || 20;
    const bubbleColor = config.bubble_color || '#25D366';
    const showTooltip = config.show_tooltip !== false;
    const tooltipText = config.tooltip_text || 'Chat with us on WhatsApp';
    
    if (!enabled) {
      console.log('[WhatsApp Bubble] Widget is disabled');
      return;
    }
    
    // Position styles
    const positions: Record<string, string> = {
      'bottom-right': `bottom: ${offsetY}px; right: ${offsetX}px;`,
      'bottom-left': `bottom: ${offsetY}px; left: ${offsetX}px;`,
      'top-right': `top: ${offsetY}px; right: ${offsetX}px;`,
      'top-left': `top: ${offsetY}px; left: ${offsetX}px;` 
    };
    
    // Create bubble container
    const bubble = document.createElement('div');
    bubble.style.cssText = `
      position: fixed;
      ${positions[position]}
      width: ${bubbleSize}px;
      height: ${bubbleSize}px;
      background-color: ${bubbleColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999999;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;
    
    // Add WhatsApp icon
    bubble.innerHTML = `
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;
    
    // Add tooltip
    if (showTooltip) {
      bubble.setAttribute('title', tooltipText);
      bubble.setAttribute('aria-label', tooltipText);
    }
    
    // Make accessible
    bubble.setAttribute('role', 'button');
    bubble.setAttribute('tabindex', '0');
    
    // Click handler
    const handleClick = () => {
      const message = encodeURIComponent(defaultMessage);
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const url = isMobile
        ? `whatsapp://send?phone=${phoneNumber}&text=${message}` 
        : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
      
      console.log('[WhatsApp Bubble] Opening WhatsApp:', url);
      
      // Track click (if analytics endpoint exists)
      fetch(`${appManagerUrl}/api/widget/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_id: websiteId,
          app_id: appId,
          event_type: 'whatsapp_clicked',
          event_data: {
            phone: phoneNumber,
            has_message: !!defaultMessage,
            position: position
          }
        })
      }).catch(err => console.warn('[WhatsApp Bubble] Analytics failed:', err));
      
      window.open(url, '_blank');
    };
    
    bubble.addEventListener('click', handleClick);
    
    // Keyboard support
    bubble.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    });
    
    // Hover effects
    bubble.addEventListener('mouseenter', () => {
      bubble.style.transform = 'scale(1.1)';
      bubble.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
    });
    
    bubble.addEventListener('mouseleave', () => {
      bubble.style.transform = 'scale(1)';
      bubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    // Add to page
    document.body.appendChild(bubble);
    
    console.log('[WhatsApp Bubble] Widget initialized successfully');
  }
})();
