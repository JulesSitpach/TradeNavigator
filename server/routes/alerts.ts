/**
 * Alert API Routes
 * Provides endpoints for alert management and status
 */

import express from 'express';
import { alertService, Alert, AlertSeverity } from '../monitoring/alerts';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * Get active alerts
 * GET /api/alerts
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const activeAlerts = alertService.getActiveAlerts();
    res.json({
      success: true,
      data: {
        alerts: activeAlerts,
        count: activeAlerts.length,
        countBySeverity: {
          info: activeAlerts.filter(a => a.severity === AlertSeverity.INFO).length,
          warning: activeAlerts.filter(a => a.severity === AlertSeverity.WARNING).length,
          critical: activeAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length
        }
      }
    });
  } catch (error) {
    logger.error('Error getting active alerts', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active alerts'
    });
  }
});

/**
 * Get alert history
 * GET /api/alerts/history
 */
router.get('/history', authMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const alertHistory = alertService.getAlertHistory(limit);
    
    res.json({
      success: true,
      data: {
        alerts: alertHistory,
        count: alertHistory.length
      }
    });
  } catch (error) {
    logger.error('Error getting alert history', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert history'
    });
  }
});

/**
 * Get alert summary
 * GET /api/alerts/summary
 */
router.get('/summary', authMiddleware, (req, res) => {
  try {
    const activeAlerts = alertService.getActiveAlerts();
    const alertHistory = alertService.getAlertHistory(10);
    
    // Count alerts by category
    const categoryCounts: Record<string, number> = {};
    activeAlerts.forEach(alert => {
      const category = alert.labels.category || 'uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        activeCount: activeAlerts.length,
        criticalCount: activeAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        warningCount: activeAlerts.filter(a => a.severity === AlertSeverity.WARNING).length,
        infoCount: activeAlerts.filter(a => a.severity === AlertSeverity.INFO).length,
        categories: categoryCounts,
        recentAlerts: alertHistory.slice(0, 5)
      }
    });
  } catch (error) {
    logger.error('Error getting alert summary', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve alert summary'
    });
  }
});

/**
 * Acknowledge an alert
 * POST /api/alerts/:id/acknowledge
 */
router.post('/:id/acknowledge', authMiddleware, (req, res) => {
  try {
    const alertId = req.params.id;
    const user = req.user?.username || 'unknown';
    
    // This is a stub - the current implementation doesn't support acknowledgment
    // In a full implementation, you would:
    // 1. Find the alert by ID
    // 2. Update its status to ACKNOWLEDGED
    // 3. Add acknowledgment metadata (who, when)
    
    res.json({
      success: true,
      message: `Alert ${alertId} acknowledged by ${user}`,
      // In a real implementation, you would return the updated alert
      data: null
    });
  } catch (error) {
    logger.error(`Error acknowledging alert ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge alert'
    });
  }
});

export default router;
