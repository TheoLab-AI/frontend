"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	/**
	 * Fallback puede ser un ReactNode estático o una función que recibe el error
	 * y un retry handler. Permite construir fallbacks que se auto-recuperen al
	 * remontar el subtree (útil para chunks dinámicos / lazy() con red intermitente).
	 */
	fallback: ReactNode | ((args: { error: Error; retry: () => void }) => ReactNode);
	/** Callback opcional para telemetría / logging externo. */
	onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	override state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	override componentDidCatch(error: Error, info: ErrorInfo): void {
		this.props.onError?.(error, info);
	}

	private readonly handleRetry = (): void => {
		this.setState({ error: null });
	};

	override render(): ReactNode {
		const { error } = this.state;
		if (error !== null) {
			const { fallback } = this.props;
			if (typeof fallback === "function") {
				return fallback({ error, retry: this.handleRetry });
			}
			return fallback;
		}
		return this.props.children;
	}
}
