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
    
    // Inject CSS to control AI Agents visibility
    function toggleAIAgentsVisibility(shouldShow) {
        // Remove existing style if present
        const existingStyle = document.getElementById('automator-ai-agents-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Create new style element
        const style = document.createElement('style');
        style.id = 'automator-ai-agents-style';
        style.type = 'text/css';
        
        // Set CSS rule based on visibility
        const displayValue = shouldShow ? 'flex' : 'none';
        style.innerHTML = `
            #sb_AI\\ Agents { display: ${displayValue}; }
            #sb_conversation_ai_settings_v2 { display: ${displayValue}; }
            #sb_knowledge_base_settings { display: ${displayValue}; }
            #sb_ai_agent_settings { display: ${displayValue}; }
        `;
        
        // Inject into document head
        document.head.appendChild(style);
        
        // CSS injected silently
    }
    
    // Process SaaS information (console logging only)
    function displaySaasInfo(saasData) {
        // Special override for specific location_id
        if (saasData.location_id === 'QJ103qxfEO9Dj2mFP0BJ') {
            toggleAIAgentsVisibility(true);
            console.log(`${saasData.response.saas_plan || 'Unknown'}: show (override)`);
            return;
        }
        
        // Check if plan should hide AI Agents and toggle visibility
        const shouldHide = shouldHideAIAgents(saasData.response.saas_plan);
        toggleAIAgentsVisibility(!shouldHide);
        
        // Log simple result
        const action = shouldHide ? 'hide' : 'show';
        console.log(`${saasData.response.saas_plan || 'Unknown'}: ${action}`);
    }
    
    // Log loading state
    function showLoadingIndicator() {
        // Loading silently
    }
    
    // Log error message
    function showError(message) {
        // Hide AI Agents elements when there's an API error
        toggleAIAgentsVisibility(false);
        
        // Log simple error
        console.log(`Error: hide`);
    }
    
    // Main execution function
    async function executeSaasCheck() {
        const locationId = getLocationIdFromUrl();
        
        if (!locationId) {
            console.log('No location: hide');
            toggleAIAgentsVisibility(false);
            return;
        }
        
        try {
            showLoadingIndicator();
            
            const saasData = await checkSaasPlan(locationId);
            
            // Store location_id in the response for logging
            saasData.location_id = locationId;
            
            displaySaasInfo(saasData);
            
        } catch (error) {
            showError(error.message);
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
