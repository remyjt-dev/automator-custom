(function() {
    'use strict';
    
    // Configuration
    const API_ENDPOINT = 'https://default-reply.bubbleapps.io/version-test/api/1.1/wf/saas_check/';
    
    // Extract location_id from URL
    function getLocationIdFromUrl() {
        const currentUrl = window.location.href;
        // Match pattern: /location/{location_id}/ where location_id can contain alphanumeric characters
        const locationMatch = currentUrl.match(/\/location\/([a-zA-Z0-9]+)/);
        return locationMatch ? locationMatch[1] : null;
    }
    
    // Make API request to check SaaS plan
    async function checkSaasPlan(locationId) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    location_id: locationId
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (data.status !== 'success') {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('SaaS Plan Check Error:', error);
            throw error;
        }
    }
    
    // Check if SaaS plan should hide AI Agents
    function shouldHideAIAgents(saasPlan) {
        if (!saasPlan || typeof saasPlan !== 'string') {
            return true; // Hide if plan is empty/null
        }
        
        const plansToHide = [
            "Paid - Professional",
            "Trial - Professional",
            "Trial - Ultimate", 
            "Trial Premium"
        ];
        
        return plansToHide.includes(saasPlan.trim());
    }
    
    // Show/hide AI Agents elements based on plan
    function toggleAIAgentsVisibility(shouldShow) {
        const aiAgentsElements = document.querySelectorAll('#sb_AI\\ Agents');
        aiAgentsElements.forEach(element => {
            if (shouldShow) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
        
        console.log(`AI Agents elements ${shouldShow ? 'shown' : 'hidden'} (${aiAgentsElements.length} elements found)`);
    }
    
    // Display SaaS information on the page
    function displaySaasInfo(saasData) {
        // Check if plan should hide AI Agents and toggle visibility
        const shouldHide = shouldHideAIAgents(saasData.response.saas_plan);
        toggleAIAgentsVisibility(!shouldHide);
        
        // Remove any existing SaaS info display
        const existingDisplay = document.getElementById('saas-info-display');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        // Create display container
        const displayContainer = document.createElement('div');
        displayContainer.id = 'saas-info-display';
        displayContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        
        const statusColor = shouldHide ? '#10b981' : '#f59e0b';
        const statusText = shouldHide ? 'Premium Plan Active' : 'Basic Plan Active';
        
        displayContainer.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <div style="width: 8px; height: 8px; background: ${statusColor}; border-radius: 50%; margin-right: 8px;"></div>
                <strong style="color: #1f2937;">${statusText}</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; border: none; background: none; font-size: 18px; cursor: pointer; color: #6b7280;">&times;</button>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="color: #6b7280;">Plan:</span>
                <strong style="color: #1f2937; margin-left: 8px;">${saasData.response.saas_plan || 'Unknown'}</strong>
            </div>
            <div style="margin-bottom: 8px;">
                <span style="color: #6b7280;">Billing:</span>
                <strong style="color: #1f2937; margin-left: 8px;">${saasData.response.saas_pricing || 'Unknown'}</strong>
            </div>
            ${shouldHide ? '<div style="font-size: 12px; color: #10b981; margin-top: 8px; font-weight: 500;">AI Agents features are hidden</div>' : '<div style="font-size: 12px; color: #f59e0b; margin-top: 8px; font-weight: 500;">AI Agents features are visible</div>'}
            <div style="font-size: 12px; color: #9ca3af; margin-top: 12px;">
                Location ID: ${saasData.location_id || 'N/A'}
            </div>
        `;
        
        document.body.appendChild(displayContainer);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (document.getElementById('saas-info-display')) {
                displayContainer.remove();
            }
        }, 10000);
    }
    
    // Show loading indicator
    function showLoadingIndicator() {
        const loadingContainer = document.createElement('div');
        loadingContainer.id = 'saas-loading-display';
        loadingContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        
        loadingContainer.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="width: 16px; height: 16px; border: 2px solid #e5e7eb; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px;"></div>
                <span style="color: #1f2937;">Checking SaaS plan...</span>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(loadingContainer);
    }
    
    // Show error message
    function showError(message) {
        // Hide AI Agents elements when there's an API error
        toggleAIAgentsVisibility(false);
        
        // Remove loading indicator
        const loadingDisplay = document.getElementById('saas-loading-display');
        if (loadingDisplay) {
            loadingDisplay.remove();
        }
        
        const errorContainer = document.createElement('div');
        errorContainer.id = 'saas-error-display';
        errorContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        
        errorContainer.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 8px;"></div>
                <strong style="color: #dc2626;">SaaS Check Failed</strong>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; border: none; background: none; font-size: 18px; cursor: pointer; color: #dc2626;">&times;</button>
            </div>
            <div style="color: #dc2626;">
                ${message}
            </div>
            <div style="font-size: 12px; color: #dc2626; margin-top: 8px; font-weight: 500;">AI Agents features are hidden</div>
        `;
        
        document.body.appendChild(errorContainer);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (document.getElementById('saas-error-display')) {
                errorContainer.remove();
            }
        }, 8000);
    }
    
    // Main execution function
    async function executeSaasCheck() {
        const locationId = getLocationIdFromUrl();
        
        if (!locationId) {
            console.warn('SaaS Check: No location_id found in URL');
            // Hide AI Agents elements when no location_id is found
            toggleAIAgentsVisibility(false);
            return;
        }
        
        console.log('SaaS Check: Found location_id:', locationId);
        
        try {
            showLoadingIndicator();
            
            const saasData = await checkSaasPlan(locationId);
            
            // Remove loading indicator
            const loadingDisplay = document.getElementById('saas-loading-display');
            if (loadingDisplay) {
                loadingDisplay.remove();
            }
            
            // Store location_id in the response for display
            saasData.location_id = locationId;
            
            displaySaasInfo(saasData);
            
            console.log('SaaS Check Success:', saasData);
            
        } catch (error) {
            showError(error.message);
            console.error('SaaS Check Failed:', error);
        }
    }
    
    // Execute when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeSaasCheck);
    } else {
        executeSaasCheck();
    }
    
    // Also execute on URL changes (for single-page applications)
    let currentUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== currentUrl) {
            currentUrl = window.location.href;
            setTimeout(executeSaasCheck, 1000); // Small delay to allow page to settle
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expose function globally for manual triggering
    window.checkSaasPlan = executeSaasCheck;
    
})();