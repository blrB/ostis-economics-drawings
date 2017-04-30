var EconomicsDebug = {
    
    enabled: true,
    
    error: function(message) {
        if (!this.enabled) return; // do nothing
        
        throw message;
    }
    
}
