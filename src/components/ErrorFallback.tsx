import type { FallbackProps } from 'react-error-boundary'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="error-fallback">
      <div className="error-fallback__card">
        <h2 className="error-fallback__title">문제가 생겼어요</h2>
        <p className="error-fallback__desc">
          예상치 못한 오류가 발생했습니다. 새로고침하면 대부분 해결됩니다.
        </p>
        {import.meta.env.DEV && (
          <pre className="error-fallback__detail">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
        <button className="error-fallback__btn" onClick={resetErrorBoundary}>
          새로고침
        </button>
      </div>
    </div>
  )
}
