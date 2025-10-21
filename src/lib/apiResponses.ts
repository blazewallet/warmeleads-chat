import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiResponseHandler {
  static success<T>(data: T, message?: string, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message
    }, { status });
  }

  static error(message: string, status = 400, error?: any): NextResponse<ApiResponse> {
    // Log error in development or for debugging
    if (process.env.NODE_ENV === 'development' && error) {
      console.error('API Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: message
    }, { status });
  }

  static serverError(message = 'Er is een onverwachte fout opgetreden', error?: any): NextResponse<ApiResponse> {
    if (process.env.NODE_ENV === 'development' && error) {
      console.error('Server Error:', error);
    }

    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }

  static notFound(message = 'Resource niet gevonden'): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 404 });
  }

  static unauthorized(message = 'Niet geautoriseerd'): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 401 });
  }

  static validationError(message = 'Validatie fout', details?: any): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error: message,
      details
    }, { status: 422 });
  }
}
