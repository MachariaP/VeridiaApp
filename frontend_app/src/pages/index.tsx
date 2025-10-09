/**
 * Home Page - VeridiaApp
 * Modern, Mobile-First, Eye-Catching Design
 */
import { useEffect, useState } from 'react'
import { getConfig, getApiBaseUrl } from '@/lib/config'
import styles from '@/styles/Home.module.css'

export default function Home() {
  const [config, setConfig] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking')

  useEffect(() => {
    // Load runtime configuration
    const runtimeConfig = getConfig()
    setConfig(runtimeConfig)

    // Check API health
    checkApiHealth()
  }, [])

  const checkApiHealth = async () => {
    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/health`)
      if (response.ok) {
        setApiStatus('healthy')
      } else {
        setApiStatus('unhealthy')
      }
    } catch (error) {
      setApiStatus('unhealthy')
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Welcome to <span className={styles.brand}>VeridiaApp</span>
          </h1>
          <p className={styles.subtitle}>
            Verified, AI-Assisted Content Platform
          </p>
        </div>

        <div className={styles.statusCard}>
          <h2>System Status</h2>
          {config && (
            <div className={styles.configInfo}>
              <div className={styles.configItem}>
                <span className={styles.label}>API Base URL:</span>
                <code className={styles.value}>{config.API_BASE_URL}</code>
              </div>
              <div className={styles.configItem}>
                <span className={styles.label}>Environment:</span>
                <code className={styles.value}>{config.ENVIRONMENT}</code>
              </div>
              <div className={styles.configItem}>
                <span className={styles.label}>Version:</span>
                <code className={styles.value}>{config.VERSION}</code>
              </div>
              <div className={styles.configItem}>
                <span className={styles.label}>API Status:</span>
                <span className={`${styles.statusBadge} ${styles[apiStatus]}`}>
                  {apiStatus === 'checking' && '⏳ Checking...'}
                  {apiStatus === 'healthy' && '✅ Healthy'}
                  {apiStatus === 'unhealthy' && '❌ Unhealthy'}
                </span>
              </div>
            </div>
          )}
          {!config && <p>Loading configuration...</p>}
        </div>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔐</div>
            <h3>Secure Authentication</h3>
            <p>JWT-based OAuth2 authentication with secure password hashing</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI Verification</h3>
            <p>Asynchronous ML inference for content verification and bias detection</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Community Scoring</h3>
            <p>Immutable audit logs and Redis-based rate limiting</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Runtime Config</h3>
            <p>Dynamic configuration without rebuilding - true deployment flexibility</p>
          </div>
        </div>

        <div className={styles.architectureInfo}>
          <h2>Microservices Architecture</h2>
          <div className={styles.services}>
            <div className={styles.serviceItem}>
              <strong>Core API Gateway</strong>
              <span>Port 8000</span>
            </div>
            <div className={styles.serviceItem}>
              <strong>AI Verification Engine</strong>
              <span>Port 8002</span>
            </div>
            <div className={styles.serviceItem}>
              <strong>Audit & Scoring Service</strong>
              <span>Port 8003</span>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>VeridiaApp - Production-Ready Full-Stack System</p>
        <p>Built with FastAPI + TypeScript + Next.js</p>
      </footer>
    </div>
  )
}
