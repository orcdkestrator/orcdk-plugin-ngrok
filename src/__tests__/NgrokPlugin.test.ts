import { NgrokPlugin } from '../index';

describe('NgrokPlugin', () => {
  it('should be defined', () => {
    expect(NgrokPlugin).toBeDefined();
  });

  it('should have correct name', () => {
    const plugin = new NgrokPlugin();
    expect(plugin.name).toBe('@orcdkestrator/orcdk-plugin-ngrok');
  });
});
