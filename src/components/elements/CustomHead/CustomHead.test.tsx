import { render } from '@testing-library/react';
import CustomHead from './CustomHead';
import '@testing-library/jest-dom/extend-expect';

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    },
  };
});

describe('CustomHead', () => {
  it('機能のテスト', async () => {
    // 設定したタイトルが反映されているか
    const title = 'タイトルテスト';
    render(<CustomHead title={title} />);
    expect(document.title).toBe(title);

    // 設定したdescriptionが反映されているか
    const description = 'descriptionテスト';
    render(<CustomHead title={title} description={description} />);
    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toHaveAttribute('content', description);
  });
});
