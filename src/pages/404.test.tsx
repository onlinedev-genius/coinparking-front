import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import NotFoundPage from './404';

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    },
  };
});

describe('NotFoundPage', () => {
  it('レンダリング関連のテスト', async () => {
    render(<NotFoundPage />);

    // タイトルが「404 | コインパーキング24」になっているか
    const title = '404 | コインパーキング24';
    expect(document.title).toBe(title);

    // 「404」の文字列が存在するか
    const errorNumber = screen.getByText('404');
    expect(errorNumber).toBeInTheDocument();

    // 「Page Not Found」の文字列が存在するか
    const errorMessage = screen.getByText('Page Not Found');
    expect(errorMessage).toBeInTheDocument();
  });
});
