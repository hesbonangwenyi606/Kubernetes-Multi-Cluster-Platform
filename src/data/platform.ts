// Shared domain data for the Kubernetes Multi-Cluster Platform.
// Single source of truth — import from here, never duplicate.

export interface Cluster {
  id: string;
  name: string;
  provider: 'AWS' | 'GCP' | 'Azure' | 'On-Prem';
  region: string;
  version: string;
  status: 'healthy' | 'degraded' | 'critical';
  nodes: number;
  pods: number;
  namespaces: number;
  cpu: number; // % utilization
  memory: number;
  network: number; // MB/s
  argoSynced: number;
  argoTotal: number;
  istioEnabled: boolean;
  x: number; // topology position (0-100)
  y: number;
}

export const clusters: Cluster[] = [
  { id: 'prod-us-east', name: 'prod-us-east', provider: 'AWS', region: 'us-east-1', version: 'v1.29.4', status: 'healthy', nodes: 24, pods: 847, namespaces: 18, cpu: 62, memory: 71, network: 342, argoSynced: 42, argoTotal: 42, istioEnabled: true, x: 22, y: 32 },
  { id: 'prod-eu-west', name: 'prod-eu-west', provider: 'GCP', region: 'europe-west1', version: 'v1.29.4', status: 'healthy', nodes: 18, pods: 623, namespaces: 14, cpu: 54, memory: 66, network: 288, argoSynced: 38, argoTotal: 38, istioEnabled: true, x: 55, y: 18 },
  { id: 'prod-ap-south', name: 'prod-ap-south', provider: 'AWS', region: 'ap-south-1', version: 'v1.28.9', status: 'degraded', nodes: 12, pods: 401, namespaces: 11, cpu: 83, memory: 78, network: 195, argoSynced: 29, argoTotal: 31, istioEnabled: true, x: 82, y: 40 },
  { id: 'staging-central', name: 'staging-central', provider: 'Azure', region: 'centralus', version: 'v1.30.1', status: 'healthy', nodes: 8, pods: 214, namespaces: 9, cpu: 38, memory: 45, network: 87, argoSynced: 24, argoTotal: 24, istioEnabled: true, x: 38, y: 62 },
  { id: 'edge-onprem', name: 'edge-onprem', provider: 'On-Prem', region: 'dc-frankfurt', version: 'v1.28.9', status: 'critical', nodes: 6, pods: 132, namespaces: 6, cpu: 91, memory: 88, network: 44, argoSynced: 11, argoTotal: 14, istioEnabled: false, x: 68, y: 70 },
];

export interface ArgoApp {
  id: string;
  name: string;
  cluster: string;
  namespace: string;
  syncStatus: 'Synced' | 'OutOfSync' | 'Progressing' | 'Unknown';
  health: 'Healthy' | 'Degraded' | 'Progressing' | 'Missing';
  repo: string;
  path: string;
  revision: string;
  lastSync: string;
  autoSync: boolean;
}

export const argoApps: ArgoApp[] = [
  { id: 'a1', name: 'payments-api', cluster: 'prod-us-east', namespace: 'payments', syncStatus: 'Synced', health: 'Healthy', repo: 'git@github.com:acme/payments', path: 'deploy/prod', revision: 'f3a92c1', lastSync: '2m ago', autoSync: true },
  { id: 'a2', name: 'checkout-frontend', cluster: 'prod-us-east', namespace: 'storefront', syncStatus: 'Synced', health: 'Healthy', repo: 'git@github.com:acme/checkout', path: 'k8s/overlays/prod', revision: 'b81d4e7', lastSync: '5m ago', autoSync: true },
  { id: 'a3', name: 'inventory-service', cluster: 'prod-eu-west', namespace: 'inventory', syncStatus: 'Progressing', health: 'Progressing', repo: 'git@github.com:acme/inventory', path: 'helm/inventory', revision: '4c7f2a9', lastSync: '32s ago', autoSync: true },
  { id: 'a4', name: 'auth-gateway', cluster: 'prod-ap-south', namespace: 'auth', syncStatus: 'OutOfSync', health: 'Degraded', repo: 'git@github.com:acme/auth', path: 'deploy/prod', revision: 'e19c6b3', lastSync: '18m ago', autoSync: false },
  { id: 'a5', name: 'notifications-worker', cluster: 'prod-ap-south', namespace: 'messaging', syncStatus: 'OutOfSync', health: 'Missing', repo: 'git@github.com:acme/notifications', path: 'k8s/prod', revision: '77aa01d', lastSync: '41m ago', autoSync: false },
  { id: 'a6', name: 'analytics-pipeline', cluster: 'prod-eu-west', namespace: 'data', syncStatus: 'Synced', health: 'Healthy', repo: 'git@github.com:acme/analytics', path: 'argo/prod', revision: '9d2e8f4', lastSync: '11m ago', autoSync: true },
  { id: 'a7', name: 'search-indexer', cluster: 'staging-central', namespace: 'search', syncStatus: 'Synced', health: 'Healthy', repo: 'git@github.com:acme/search', path: 'deploy/staging', revision: 'c4b7a12', lastSync: '3m ago', autoSync: true },
  { id: 'a8', name: 'edge-cache', cluster: 'edge-onprem', namespace: 'cdn', syncStatus: 'Unknown', health: 'Degraded', repo: 'git@github.com:acme/edge-cache', path: 'manifests', revision: '2f8e5c0', lastSync: '2h ago', autoSync: false },
];

export interface PipelineStage {
  name: string;
  status: 'done' | 'active' | 'pending' | 'failed';
}

export interface Deployment {
  id: string;
  app: string;
  cluster: string;
  version: string;
  time: string;
  author: string;
  stages: PipelineStage[];
}

export const deployments: Deployment[] = [
  { id: 'd1', app: 'inventory-service', cluster: 'prod-eu-west', version: 'v2.14.0', time: 'in progress', author: 'sarah.chen', stages: [{ name: 'Git Push', status: 'done' }, { name: 'Build', status: 'done' }, { name: 'Test', status: 'done' }, { name: 'ArgoCD Sync', status: 'active' }, { name: 'Canary', status: 'pending' }, { name: 'Promote', status: 'pending' }] },
  { id: 'd2', app: 'payments-api', cluster: 'prod-us-east', version: 'v3.8.2', time: '2m ago', author: 'mike.torres', stages: [{ name: 'Git Push', status: 'done' }, { name: 'Build', status: 'done' }, { name: 'Test', status: 'done' }, { name: 'ArgoCD Sync', status: 'done' }, { name: 'Canary', status: 'done' }, { name: 'Promote', status: 'done' }] },
  { id: 'd3', app: 'auth-gateway', cluster: 'prod-ap-south', version: 'v1.22.1', time: '18m ago', author: 'deploy-bot', stages: [{ name: 'Git Push', status: 'done' }, { name: 'Build', status: 'done' }, { name: 'Test', status: 'failed' }, { name: 'ArgoCD Sync', status: 'pending' }, { name: 'Canary', status: 'pending' }, { name: 'Promote', status: 'pending' }] },
  { id: 'd4', app: 'checkout-frontend', cluster: 'prod-us-east', version: 'v5.1.0', time: '1h ago', author: 'lena.kovacs', stages: [{ name: 'Git Push', status: 'done' }, { name: 'Build', status: 'done' }, { name: 'Test', status: 'done' }, { name: 'ArgoCD Sync', status: 'done' }, { name: 'Canary', status: 'done' }, { name: 'Promote', status: 'done' }] },
];

export interface HelmChart {
  id: string;
  name: string;
  repo: string;
  version: string;
  appVersion: string;
  description: string;
  category: 'Monitoring' | 'Networking' | 'Database' | 'Security' | 'CI/CD' | 'Storage' | 'Messaging';
  stars: number;
  installed: string[]; // cluster ids
}

export const helmCharts: HelmChart[] = [
  { id: 'h1', name: 'prometheus', repo: 'prometheus-community', version: '25.21.0', appVersion: 'v2.52.0', description: 'Monitoring system & time series database with alerting.', category: 'Monitoring', stars: 4821, installed: ['prod-us-east', 'prod-eu-west', 'prod-ap-south', 'staging-central'] },
  { id: 'h2', name: 'grafana', repo: 'grafana', version: '8.0.2', appVersion: '11.0.0', description: 'Open observability platform for dashboards and analytics.', category: 'Monitoring', stars: 3977, installed: ['prod-us-east', 'prod-eu-west'] },
  { id: 'h3', name: 'istio-base', repo: 'istio', version: '1.22.1', appVersion: '1.22.1', description: 'Istio service mesh base components and CRDs.', category: 'Networking', stars: 3312, installed: ['prod-us-east', 'prod-eu-west', 'prod-ap-south', 'staging-central'] },
  { id: 'h4', name: 'istiod', repo: 'istio', version: '1.22.1', appVersion: '1.22.1', description: 'Istio control plane for traffic management and mTLS.', category: 'Networking', stars: 3298, installed: ['prod-us-east', 'prod-eu-west', 'prod-ap-south'] },
  { id: 'h5', name: 'argo-cd', repo: 'argoproj', version: '7.1.3', appVersion: 'v2.11.3', description: 'Declarative GitOps continuous delivery for Kubernetes.', category: 'CI/CD', stars: 4102, installed: ['prod-us-east', 'prod-eu-west', 'prod-ap-south', 'staging-central', 'edge-onprem'] },
  { id: 'h6', name: 'cert-manager', repo: 'jetstack', version: '1.15.0', appVersion: 'v1.15.0', description: 'Automated X.509 certificate management for Kubernetes.', category: 'Security', stars: 3541, installed: ['prod-us-east', 'prod-eu-west', 'staging-central'] },
  { id: 'h7', name: 'ingress-nginx', repo: 'kubernetes', version: '4.10.1', appVersion: '1.10.1', description: 'NGINX Ingress Controller for Kubernetes.', category: 'Networking', stars: 4455, installed: ['prod-us-east', 'staging-central', 'edge-onprem'] },
  { id: 'h8', name: 'postgresql-ha', repo: 'bitnami', version: '14.2.5', appVersion: '16.3.0', description: 'Highly-available PostgreSQL cluster with Pgpool-II.', category: 'Database', stars: 2876, installed: ['prod-us-east', 'prod-eu-west'] },
  { id: 'h9', name: 'redis-cluster', repo: 'bitnami', version: '10.2.1', appVersion: '7.2.5', description: 'Redis cluster with automatic sharding and replication.', category: 'Database', stars: 3103, installed: ['prod-us-east', 'prod-eu-west', 'prod-ap-south'] },
  { id: 'h10', name: 'kafka', repo: 'bitnami', version: '29.3.2', appVersion: '3.7.0', description: 'Distributed event streaming platform with KRaft mode.', category: 'Messaging', stars: 2988, installed: ['prod-us-east', 'prod-eu-west'] },
  { id: 'h11', name: 'vault', repo: 'hashicorp', version: '0.28.0', appVersion: '1.16.1', description: 'Secrets management, encryption as a service, and PKI.', category: 'Security', stars: 3667, installed: ['prod-us-east'] },
  { id: 'h12', name: 'loki-stack', repo: 'grafana', version: '2.10.2', appVersion: 'v2.9.8', description: 'Log aggregation system designed for high scalability.', category: 'Monitoring', stars: 2534, installed: ['prod-us-east', 'prod-eu-west', 'staging-central'] },
  { id: 'h13', name: 'velero', repo: 'vmware-tanzu', version: '6.6.0', appVersion: '1.13.2', description: 'Backup and disaster recovery for cluster resources.', category: 'Storage', stars: 2211, installed: ['prod-us-east', 'prod-eu-west'] },
  { id: 'h14', name: 'longhorn', repo: 'longhorn', version: '1.6.2', appVersion: 'v1.6.2', description: 'Cloud-native distributed block storage for Kubernetes.', category: 'Storage', stars: 1987, installed: ['edge-onprem'] },
  { id: 'h15', name: 'keycloak', repo: 'bitnami', version: '21.4.4', appVersion: '24.0.5', description: 'Open source identity and access management (SSO/OIDC).', category: 'Security', stars: 2410, installed: ['prod-us-east', 'staging-central'] },
  { id: 'h16', name: 'rabbitmq', repo: 'bitnami', version: '14.4.1', appVersion: '3.13.2', description: 'Reliable and mature message broker with clustering.', category: 'Messaging', stars: 2145, installed: ['prod-ap-south'] },
  { id: 'h17', name: 'jaeger', repo: 'jaegertracing', version: '3.0.10', appVersion: '1.57.0', description: 'End-to-end distributed tracing for microservices.', category: 'Monitoring', stars: 1876, installed: ['prod-us-east', 'prod-eu-west'] },
  { id: 'h18', name: 'external-dns', repo: 'kubernetes-sigs', version: '1.14.4', appVersion: '0.14.2', description: 'Sync exposed Services and Ingresses with DNS providers.', category: 'Networking', stars: 1654, installed: ['prod-us-east', 'prod-eu-west', 'prod-ap-south'] },
];

export const helmCategories = ['All', 'Monitoring', 'Networking', 'Database', 'Security', 'CI/CD', 'Storage', 'Messaging'] as const;

export interface MeshService {
  id: string;
  name: string;
  namespace: string;
  x: number;
  y: number;
  latencyP99: number; // ms
  rps: number;
  errorRate: number; // %
  tier: 'gateway' | 'service' | 'data';
}

export const meshServices: MeshService[] = [
  { id: 's1', name: 'istio-ingress', namespace: 'istio-system', x: 8, y: 45, latencyP99: 4, rps: 2840, errorRate: 0.01, tier: 'gateway' },
  { id: 's2', name: 'checkout-frontend', namespace: 'storefront', x: 30, y: 20, latencyP99: 38, rps: 1420, errorRate: 0.12, tier: 'service' },
  { id: 's3', name: 'auth-gateway', namespace: 'auth', x: 30, y: 70, latencyP99: 22, rps: 1980, errorRate: 2.41, tier: 'service' },
  { id: 's4', name: 'payments-api', namespace: 'payments', x: 55, y: 32, latencyP99: 87, rps: 640, errorRate: 0.08, tier: 'service' },
  { id: 's5', name: 'inventory-service', namespace: 'inventory', x: 55, y: 58, latencyP99: 45, rps: 890, errorRate: 0.31, tier: 'service' },
  { id: 's6', name: 'notifications', namespace: 'messaging', x: 55, y: 84, latencyP99: 12, rps: 310, errorRate: 0.02, tier: 'service' },
  { id: 's7', name: 'postgresql-ha', namespace: 'data', x: 82, y: 25, latencyP99: 6, rps: 3200, errorRate: 0.0, tier: 'data' },
  { id: 's8', name: 'redis-cluster', namespace: 'data', x: 82, y: 50, latencyP99: 1, rps: 8900, errorRate: 0.0, tier: 'data' },
  { id: 's9', name: 'kafka', namespace: 'data', x: 82, y: 76, latencyP99: 9, rps: 5400, errorRate: 0.01, tier: 'data' },
];

export interface MeshEdge {
  from: string;
  to: string;
  latency: number; // ms
}

export const meshEdges: MeshEdge[] = [
  { from: 's1', to: 's2', latency: 3 },
  { from: 's1', to: 's3', latency: 5 },
  { from: 's2', to: 's4', latency: 14 },
  { from: 's2', to: 's5', latency: 11 },
  { from: 's3', to: 's4', latency: 42 },
  { from: 's3', to: 's8', latency: 2 },
  { from: 's4', to: 's7', latency: 4 },
  { from: 's4', to: 's9', latency: 8 },
  { from: 's5', to: 's7', latency: 5 },
  { from: 's5', to: 's8', latency: 1 },
  { from: 's6', to: 's9', latency: 7 },
  { from: 's5', to: 's6', latency: 9 },
];

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  cluster: string;
  source: 'Prometheus' | 'ArgoCD' | 'Istio' | 'Kubernetes';
  time: string;
  description: string;
  acknowledged: boolean;
}

export const initialAlerts: Alert[] = [
  { id: 'al1', severity: 'critical', title: 'NodeMemoryPressure', cluster: 'edge-onprem', source: 'Kubernetes', time: '3m ago', description: 'Node edge-worker-04 reporting memory pressure. 88% utilization sustained for 15m.', acknowledged: false },
  { id: 'al2', severity: 'critical', title: 'HighErrorRate auth-gateway', cluster: 'prod-ap-south', source: 'Istio', time: '9m ago', description: '5xx error rate at 2.41% exceeds SLO threshold of 1% over 5m window.', acknowledged: false },
  { id: 'al3', severity: 'warning', title: 'ArgoCD OutOfSync', cluster: 'prod-ap-south', source: 'ArgoCD', time: '18m ago', description: 'Applications auth-gateway and notifications-worker drifted from Git desired state.', acknowledged: false },
  { id: 'al4', severity: 'warning', title: 'CPUThrottlingHigh', cluster: 'prod-ap-south', source: 'Prometheus', time: '24m ago', description: 'Container payments-worker throttled 42% of CPU periods in namespace payments.', acknowledged: false },
  { id: 'al5', severity: 'warning', title: 'PersistentVolume 85% full', cluster: 'prod-us-east', source: 'Prometheus', time: '1h ago', description: 'PVC data-postgresql-ha-2 in namespace data at 85% capacity.', acknowledged: true },
  { id: 'al6', severity: 'info', title: 'Cluster upgrade available', cluster: 'prod-ap-south', source: 'Kubernetes', time: '2h ago', description: 'Kubernetes v1.29.4 is available for cluster running v1.28.9.', acknowledged: false },
  { id: 'al7', severity: 'info', title: 'Certificate rotation complete', cluster: 'prod-eu-west', source: 'Kubernetes', time: '4h ago', description: 'cert-manager rotated 12 TLS certificates successfully.', acknowledged: true },
];

// Prometheus panel definitions — series generated at runtime
export interface MetricPanel {
  id: string;
  title: string;
  query: string;
  unit: string;
  color: string;
  base: number;
  variance: number;
}

export const metricPanels: MetricPanel[] = [
  { id: 'm1', title: 'Cluster CPU Utilization', query: 'sum(rate(container_cpu_usage_seconds_total[5m]))', unit: '%', color: '#00D9FF', base: 62, variance: 12 },
  { id: 'm2', title: 'Memory Working Set', query: 'sum(container_memory_working_set_bytes)', unit: 'GiB', color: '#00FF88', base: 412, variance: 40 },
  { id: 'm3', title: 'Network Receive', query: 'sum(rate(node_network_receive_bytes_total[5m]))', unit: 'MB/s', color: '#A78BFA', base: 340, variance: 90 },
  { id: 'm4', title: 'Network Transmit', query: 'sum(rate(node_network_transmit_bytes_total[5m]))', unit: 'MB/s', color: '#F472B6', base: 285, variance: 70 },
  { id: 'm5', title: 'HTTP Request Rate', query: 'sum(rate(http_requests_total[1m]))', unit: 'req/s', color: '#FFB800', base: 2800, variance: 500 },
  { id: 'm6', title: 'P99 Latency', query: 'histogram_quantile(0.99, http_request_duration_seconds)', unit: 'ms', color: '#FB7185', base: 87, variance: 30 },
  { id: 'm7', title: 'Pod Restarts (1h)', query: 'sum(increase(kube_pod_container_status_restarts_total[1h]))', unit: '', color: '#38BDF8', base: 4, variance: 3 },
  { id: 'm8', title: 'etcd Commit Duration', query: 'histogram_quantile(0.99, etcd_disk_backend_commit_duration)', unit: 'ms', color: '#34D399', base: 12, variance: 5 },
  { id: 'm9', title: 'API Server Requests', query: 'sum(rate(apiserver_request_total[5m]))', unit: 'req/s', color: '#E879F9', base: 940, variance: 180 },
  { id: 'm10', title: 'Disk IOPS', query: 'sum(rate(node_disk_io_time_seconds_total[5m]))', unit: 'ops', color: '#FBBF24', base: 1250, variance: 300 },
  { id: 'm11', title: 'Kafka Consumer Lag', query: 'sum(kafka_consumergroup_lag)', unit: 'msgs', color: '#F87171', base: 320, variance: 150 },
  { id: 'm12', title: 'Istio mTLS Success', query: 'sum(rate(istio_requests_total{security_policy="mutual_tls"}[5m]))', unit: '%', color: '#4ADE80', base: 99.7, variance: 0.2 },
];

export const statusColors = {
  healthy: '#00FF88',
  degraded: '#FFB800',
  critical: '#FF4D6D',
} as const;

export function genSeries(base: number, variance: number, points = 30): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v += (Math.random() - 0.5) * variance * 0.6;
    v = Math.max(0, Math.min(base + variance, v));
    out.push(Number(v.toFixed(2)));
  }
  return out;
}
