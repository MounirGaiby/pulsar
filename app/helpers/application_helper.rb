module ApplicationHelper
  # Returns the available locales for the language switcher
  def available_locales
    [
      { code: :en, label: "English", icon: "flag", library: "lucide" },
      { code: :fr, label: "Français", icon: "flag", library: "lucide" },
      { code: :ar, label: "العربية", icon: "flag", library: "lucide" }
    ]
  end
end
