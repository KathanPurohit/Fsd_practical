# anti_cheat/monitor.py

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json

from models import AntiCheatFlag, AntiCheatEvent
from anti_cheat.detector import anti_cheat_detector

logger = logging.getLogger(__name__)

class RealTimeMonitor:
    """Real-time monitoring system for anti-cheat detection."""
    
    def __init__(self):
        self.active_monitors: Dict[str, asyncio.Task] = {}
        self.monitoring_interval = 1.0  # seconds
        
    async def start_monitoring(self, session_id: str, user_id: str) -> None:
        """Start real-time monitoring for a session."""
        if session_id in self.active_monitors:
            await self.stop_monitoring(session_id)
        
        monitor_task = asyncio.create_task(
            self._monitor_session(session_id, user_id)
        )
        self.active_monitors[session_id] = monitor_task
        
        logger.info(f"Started real-time monitoring for session {session_id}")
    
    async def stop_monitoring(self, session_id: str) -> None:
        """Stop monitoring for a session."""
        if session_id in self.active_monitors:
            self.active_monitors[session_id].cancel()
            del self.active_monitors[session_id]
            logger.info(f"Stopped monitoring for session {session_id}")
    
    async def _monitor_session(self, session_id: str, user_id: str) -> None:
        """Monitor session for suspicious activities."""
        try:
            while True:
                await asyncio.sleep(self.monitoring_interval)
                
                # Check for various suspicious activities
                await self._check_tab_switching(session_id)
                await self._check_window_focus(session_id)
                await self._check_response_patterns(session_id)
                await self._check_timing_anomalies(session_id)
                
        except asyncio.CancelledError:
            logger.info(f"Monitoring cancelled for session {session_id}")
        except Exception as e:
            logger.error(f"Error in monitoring session {session_id}: {e}")
    
    async def _check_tab_switching(self, session_id: str) -> None:
        """Check for tab switching behavior."""
        # This would be called from frontend events
        pass
    
    async def _check_window_focus(self, session_id: str) -> None:
        """Check for window focus loss."""
        # This would be called from frontend events
        pass
    
    async def _check_response_patterns(self, session_id: str) -> None:
        """Check for suspicious response patterns."""
        # This would analyze recent responses
        pass
    
    async def _check_timing_anomalies(self, session_id: str) -> None:
        """Check for timing anomalies."""
        # This would analyze response times
        pass

class BrowserLockdown:
    """Browser lockdown functionality."""
    
    @staticmethod
    def generate_lockdown_script() -> str:
        """Generate JavaScript for browser lockdown."""
        return """
        // Browser Lockdown Script
        (function() {
            'use strict';
            
            let isLocked = false;
            let tabSwitchCount = 0;
            let copyPasteCount = 0;
            let windowFocusCount = 0;
            
            // Disable right-click
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                reportEvent('right_click_blocked');
            });
            
            // Disable copy-paste
            document.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
                    e.preventDefault();
                    copyPasteCount++;
                    reportEvent('copy_paste_blocked', { count: copyPasteCount });
                }
            });
            
            // Disable print screen
            document.addEventListener('keydown', function(e) {
                if (e.key === 'PrintScreen') {
                    e.preventDefault();
                    reportEvent('print_screen_blocked');
                }
            });
            
            // Monitor tab switching
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    tabSwitchCount++;
                    reportEvent('tab_switch', { count: tabSwitchCount });
                }
            });
            
            // Monitor window focus
            window.addEventListener('blur', function() {
                windowFocusCount++;
                reportEvent('window_blur', { count: windowFocusCount });
            });
            
            // Detect screen recording
            if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
                navigator.mediaDevices.getDisplayMedia = function() {
                    reportEvent('screen_recording_attempt');
                    return Promise.reject(new Error('Screen recording not allowed'));
                };
            }
            
            // Detect multiple windows
            let windowCount = 1;
            window.addEventListener('beforeunload', function() {
                if (window.opener) {
                    reportEvent('multiple_windows_detected');
                }
            });
            
            // Disable developer tools (basic detection)
            let devtools = {open: false, orientation: null};
            setInterval(function() {
                if (window.outerHeight - window.innerHeight > 200 || 
                    window.outerWidth - window.innerWidth > 200) {
                    if (!devtools.open) {
                        devtools.open = true;
                        reportEvent('devtools_detected');
                    }
                } else {
                    devtools.open = false;
                }
            }, 500);
            
            // Disable text selection
            document.addEventListener('selectstart', function(e) {
                e.preventDefault();
            });
            
            // Disable drag and drop
            document.addEventListener('dragstart', function(e) {
                e.preventDefault();
            });
            
            // Force fullscreen
            function requestFullscreen() {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
            }
            
            // Request fullscreen on load
            document.addEventListener('DOMContentLoaded', requestFullscreen);
            
            // Monitor for fullscreen exit
            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement) {
                    reportEvent('fullscreen_exit');
                    requestFullscreen();
                }
            });
            
            // Function to report events to backend
            function reportEvent(eventType, data = {}) {
                if (window.websocket && window.websocket.readyState === WebSocket.OPEN) {
                    window.websocket.send(JSON.stringify({
                        type: 'anti_cheat_event',
                        event_type: eventType,
                        data: data,
                        timestamp: new Date().toISOString()
                    }));
                }
            }
            
            // Initialize lockdown
            isLocked = true;
            console.log('Browser lockdown activated');
            
        })();
        """
    
    @staticmethod
    def generate_device_fingerprint_script() -> str:
        """Generate JavaScript for device fingerprinting."""
        return """
        function generateDeviceFingerprint() {
            const fingerprintData = {
                user_agent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screen_resolution: screen.width + 'x' + screen.height,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                canvas_fingerprint: getCanvasFingerprint(),
                webgl_fingerprint: getWebGLFingerprint()
            };
            
            return JSON.stringify(fingerprintData);
        }
        
        function getCanvasFingerprint() {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = 'top';
                ctx.font = '14px Arial';
                ctx.fillText('Canvas fingerprint', 2, 2);
                return canvas.toDataURL();
            } catch (e) {
                return 'canvas_not_supported';
            }
        }
        
        function getWebGLFingerprint() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) return 'webgl_not_supported';
                
                return gl.getParameter(gl.VERSION) + '|' + gl.getParameter(gl.VENDOR);
            } catch (e) {
                return 'webgl_error';
            }
        }
        """
    
    @staticmethod
    def generate_device_fingerprint() -> str:
        """Generate device fingerprint hash from provided data."""
        import hashlib
        
        # This would be called with data from the frontend
        # For now, return a placeholder
        return "device_fingerprint_placeholder"

# Global monitor instance
real_time_monitor = RealTimeMonitor()
browser_lockdown = BrowserLockdown()
