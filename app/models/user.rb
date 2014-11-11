require 'gmail_api_client'
require 'twitter_client'
require 'alchemyapi'

class User < ActiveRecord::Base
  has_many :supporters
  has_many :daily_reports
  has_many :check_ins, through: :daily_reports
  has_many :tweets, through: :daily_reports
  has_many :gmails, through: :daily_reports
  has_many :triggers
  has_many :trigger_histories
  has_many :tokens

  has_secure_password

  def set_token(token)
    self.tokens << token
    self.set_history_id
  end

  def twitter_token
    self.tokens.where('type=?', "TwitterToken").first
  end

  def gmail_token
    self.tokens.where('type=?', "GmailToken").first
  end

  def active? # activity on GMAIL
    if self.last_history_number != find_last_history_id
      update_active_time
      return true
    end
    return false
  end

  def update_active_time
    self.last_active = Time.now
    self.set_history_id
    self.save
  end

  def find_last_history_id
    client = GmailAPI.new(self.gmail_token)
    if self.last_history_number.nil?
      self.last_history_number = client.get_start_history_id
    else
      return client.get_last_history_id(self.last_history_number)
    end
  end

  def check_email_activity(trigger)
    unless active_in_last_hours?(trigger.duration_in_hours/60.to_f)
      self.supporters.each do |supporter|
        supporter.text(trigger.message_text)
      logger.info "checking the email activity method in #{supporter.first_name}, #{self.email}"
      end
    end

    # trigger.time_last_run = Time.now
    # trigger.save
  end

  def set_history_id
    self.last_history_number = find_last_history_id
  end

  def active_in_last_hours?(inactivity_time_limit)
    active?
    time_since_last_active = Time.now - self.last_active
    return (time_since_last_active / 3600.to_f) < inactivity_time_limit
  end

  def get_daily_tweets(daily_report)
    client = TwitterClient.new(self.twitter_token)
    tweets = client.get_most_recent_tweets(self.tweets.order("id_of_tweet").last.id_of_tweet)
    alchemyapi = AlchemyAPI.new
    tweets.each do |tweet|
      response = alchemyapi.sentiment("text", tweet.text)
      if response["status"] != "ERROR"
        daily_report.tweets << Tweet.create!(id_of_tweet: tweet.id, qualitative: response['docSentiment']['type'], quantitative: response['docSentiment']['score'].to_f)
        current_user.daily_reports << daily_report
      end
    end
  end

  def most_recent_tweet
    client = TwitterClient.new(self.twitter_token)
    alchemyapi = AlchemyAPI.new
    tweet = client.get_tweets(1)[0]
    response = alchemyapi.sentiment("text", tweet.text)
    Tweet.create!(id_of_tweet: tweet.id, qualitative: response['docSentiment']['type'], quantitative: response['docSentiment']['score'].to_f)
  end

  def get_daily_gmails(daily_report)
    client = GmailAPI.new(self.gmail_token)
    sent_gmails = client.get_emails_for_today(self.last_history_number)
    alchemyapi = AlchemyAPI.new
    sent_gmails.each do |gmail|
      sentiment_response = alchemyapi.sentiment("text", gmail)
      keyword_response = alchemyapi.keywords("text", gmail)
      if sentiment_response["status"] != "ERROR"
        database_gmail = Gmail.create!(quantitative: sentiment_response['docSentiment']['score'].to_f, qualitative: sentiment_response['docSentiment']['type'])
        keyword_response['keywords'].each{ |keyword_hash| database_gmail.keywords << Keyword.create!(keyword_hash) }
        daily_report.gmails << database_gmail
      end
    end
  end

  def toggle_twitter_triggers
    self.triggers.each do |trigger|
      if trigger.task.method =~ /twitter/i
        if trigger.active
          trigger.active = false
          trigger.save
        else
          trigger.active = true
          trigger.save
        end
      end
    end
  end

  def toggle_google_triggers
    self.triggers.each do |trigger|
      if trigger.task.method =~ /email/i
        if trigger.active
          trigger.active = false
          trigger.save
        else
          trigger.active = true
          trigger.save
        end
      end
    end
  end


  def toggle(trigger)
    if trigger.active
      trigger.active = false
      trigger.save
    else
      trigger.active = true
      trigger.save
    end
  end

  def get_daily_check_ins(daily_report)
    check_ins_for_the_day = self.check_ins.where(created_at: Date.today + 1)
    check_ins_for_the_day.each do |check_in|
      daily_report.check_ins << check_in
    end
  end

end
