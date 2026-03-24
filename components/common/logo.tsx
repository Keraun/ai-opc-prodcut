export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 六边形外框 - 填充 */}
      <path
        d="M20 2L35 10V26L20 34L5 26V10L20 2Z"
        fill="#1E40AF"
        opacity="0.1"
      />
      
      {/* 六边形边框 */}
      <path
        d="M20 2L35 10V26L20 34L5 26V10L20 2Z"
        stroke="#1E40AF"
        strokeWidth="2"
        fill="none"
      />
      
      {/* 中心六边形 */}
      <path
        d="M20 8L28 12.5V21.5L20 26L12 21.5V12.5L20 8Z"
        fill="#0891B2"
        opacity="0.3"
      />
      
      {/* 内部连接节点 */}
      <circle cx="20" cy="11" r="2.5" fill="#1E40AF" />
      <circle cx="13" cy="19" r="2.5" fill="#0891B2" />
      <circle cx="27" cy="19" r="2.5" fill="#0891B2" />
      <circle cx="20" cy="25" r="2.5" fill="#1E40AF" />
      
      {/* 连接线 */}
      <path
        d="M20 11L13 19M20 11L27 19M13 19L20 25M27 19L20 25M13 19L27 19"
        stroke="#1E40AF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
