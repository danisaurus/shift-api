require 'rails_helper'

RSpec.describe CheckIn, :type => :model do

  describe "associations" do
    it { should belong_to(:daily_report) }
  end

end
